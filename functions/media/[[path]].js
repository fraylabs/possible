// Cloudflare Pages serves static files whole, but Safari on iPhone only plays a video it can fetch in
// byte ranges (206). Answer Range requests for /media/* from the whole asset.
import { withRange } from "../../apps/web/sites-worker.mjs";

export const onRequestGet = async ({ request, next }) => withRange(request, await next());
export const onRequestHead = onRequestGet;
