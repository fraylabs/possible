import { outcomeRoutes, publishedOutcomes } from "../../src/static-outcomes";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(Object.fromEntries(outcomeRoutes(await publishedOutcomes()).map(({ path, outcome }) => [outcome.id, path])));
}
