import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};

type Claim = {
  id: string;
  account_id: string;
  target_type: "company" | "skill";
  company_id: string | null;
  skill_id: string | null;
  verification_token_hash: string | null;
  token_expires_at: string | null;
  status: string;
};

type ResponseBody = {
  error?: string;
  verified?: boolean;
  claimId?: string;
};

function response(body: ResponseBody, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "content-type": "application/json" } });
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function candidateTokens(values: string[]) {
  return values.flatMap((value) => value.replace(/^"|"$/g, "").replace(/"\s+"/g, "").split(/\s+/))
    .filter((value) => value.startsWith("possible-site-verification="))
    .map((value) => value.slice("possible-site-verification=".length).trim())
    .filter(Boolean);
}

async function verifyDns(domain: string, expectedHash: string) {
  const request = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`, { headers: { accept: "application/dns-json" } });
  if (!request.ok) return false;
  // SAFETY: only the optional Answer[].data strings are consumed from the DNS JSON response.
  const document = await request.json() as { Answer?: Array<{ data?: string }> };
  for (const token of candidateTokens((document.Answer ?? []).map(({ data }) => data ?? ""))) {
    if (await sha256(token) === expectedHash) return true;
  }
  return false;
}

async function verifyGitHub(repository: string, directory: string, expectedHash: string) {
  const repoRequest = await fetch(`https://api.github.com/repos/${repository}`, { headers: { accept: "application/vnd.github+json", "user-agent": "possible-claim-verifier" } });
  if (!repoRequest.ok) return false;
  // SAFETY: only GitHub's documented optional default_branch string is consumed.
  const { default_branch: defaultBranch } = await repoRequest.json() as { default_branch?: string };
  if (!defaultBranch) return false;
  const path = [...directory.split("/"), "possible-verification.txt"].map(encodeURIComponent).join("/");
  const fileRequest = await fetch(`https://raw.githubusercontent.com/${repository}/${encodeURIComponent(defaultBranch)}/${path}`, { headers: { "user-agent": "possible-claim-verifier" } });
  if (!fileRequest.ok) return false;
  for (const token of candidateTokens((await fileRequest.text()).split(/\r?\n/))) {
    if (await sha256(token) === expectedHash) return true;
  }
  return false;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("authorization");
  if (!authorization) return response({ error: "Authentication is required" }, 401);
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return response({ error: "Verifier is not configured" }, 500);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { authorization } } });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return response({ error: "Authentication is required" }, 401);

  // SAFETY: claimId is validated for presence before it is used as a database filter.
  const { claimId } = await request.json() as { claimId?: string };
  if (!claimId) return response({ error: "claimId is required" }, 400);
  const service = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: claimData, error: claimError } = await service.from("listing_claims").select("id,account_id,target_type,company_id,skill_id,verification_token_hash,token_expires_at,status").eq("id", claimId).maybeSingle();
  if (claimError || !claimData) return response({ error: "Claim not found" }, 404);
  // SAFETY: the explicit listing_claims select list matches Claim.
  const claim = claimData as Claim;
  const { data: membership } = await service.from("account_members").select("role").eq("account_id", claim.account_id).eq("user_id", userData.user.id).eq("role", "owner").maybeSingle();
  if (!membership) return response({ error: "Account owner access is required" }, 403);
  if (claim.status !== "pending" || !claim.verification_token_hash || !claim.token_expires_at) return response({ error: "This claim is not pending" }, 409);
  if (new Date(claim.token_expires_at).getTime() <= Date.now()) return response({ error: "This verification token has expired" }, 410);

  let verified = false;
  if (claim.target_type === "company" && claim.company_id) {
    const { data: company } = await service.from("companies").select("website_url").eq("id", claim.company_id).maybeSingle();
    if (!company?.website_url) return response({ error: "Company website not found" }, 409);
    const hostname = new URL(company.website_url).hostname.toLowerCase();
    verified = await verifyDns(`_possible.${hostname}`, claim.verification_token_hash);
  } else if (claim.target_type === "skill" && claim.skill_id) {
    const { data: skill } = await service.from("skills").select("repository,directory").eq("id", claim.skill_id).maybeSingle();
    if (!skill) return response({ error: "Skill not found" }, 409);
    verified = await verifyGitHub(skill.repository, skill.directory, claim.verification_token_hash);
  }
  if (!verified) return response({ verified: false, error: "The verification record was not found yet" }, 422);

  const { data: completedClaim, error: updateError } = await service.from("listing_claims").update({ status: "claimed", verified_at: new Date().toISOString(), verification_token_hash: null, token_expires_at: null }).eq("id", claim.id).eq("status", "pending").select("id").maybeSingle();
  if (updateError) return response({ error: updateError.code === "23505" ? "This listing was claimed by another account" : "The claim could not be completed" }, 409);
  if (!completedClaim) return response({ error: "This claim changed before verification completed" }, 409);
  if (claim.company_id) {
    await service.from("companies").update({ verification_status: "verified" }).eq("id", claim.company_id);
    await service.from("products").update({ verification_status: "verified" }).eq("company_id", claim.company_id);
  }
  await service.from("listing_claim_events").insert({ claim_id: claim.id, actor_id: userData.user.id, action: "verified" });
  return response({ verified: true, claimId: claim.id });
});
