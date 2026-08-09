import draftPack from "../../../packages/packs/src/draft-pack.json" with { type: "json" };
import outcomePackSchema from "../../../packages/packs/src/outcome-pack.schema.json" with { type: "json" };

export const draftPackExample = JSON.stringify(draftPack, null, 2);

export const packFieldDemands = Object.entries(outcomePackSchema.properties).map(([name, property]) => ({
  name,
  description: "description" in property ? property.description : "",
}));
