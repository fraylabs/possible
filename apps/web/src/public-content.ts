import cliPackage from "../../cli/package.json" with { type: "json" };

export const possibleVersion = cliPackage.version;
export const installCommand = "npx skills add https://github.com/fraylabs/possible/tree/skill/skills/possible --skill possible";
export const githubUrl = "https://github.com/fraylabs/possible";
