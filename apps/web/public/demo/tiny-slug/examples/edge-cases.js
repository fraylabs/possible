import { slugify } from "tiny-slug";

const values = [
  "  API___v2  ",
  "München guide",
  "你好",
];

for (const value of values) {
  console.log(`${JSON.stringify(value)} -> ${JSON.stringify(slugify(value))}`);
}
