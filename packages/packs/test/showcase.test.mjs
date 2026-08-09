import assert from "node:assert/strict";
import test from "node:test";
import { bundledOutcomePacks, bundledPackShowcases, getPackShowcase } from "../dist/index.js";

test("bundled showcases remain optional, typed, and separate from trust", () => {
  assert.deepEqual(
    Object.keys(bundledPackShowcases).sort(),
    bundledOutcomePacks.map(({ slug }) => slug).sort(),
  );

  const film = getPackShowcase("html-css-animated-product-launch-film");
  assert.equal(film.video.src, "/pack-media/html-css-animated-product-launch-film/media/possible-launch-film.mp4");
  assert.equal(film.images, undefined);

  const robot = getPackShowcase("fraylabs/possible/robot-digital-prototype");
  assert.equal(robot.images.length, 3);
  assert.equal(robot.images.filter(({ cover }) => cover).length, 1);
  assert.equal(robot.cad.preview, "/pack-media/robot-digital-prototype/media/robot-snake.glb");
  assert.deepEqual(robot.cad.downloads.map(({ format }) => format), ["step"]);

  const firstCustomer = getPackShowcase("first-customer-sprint");
  assert.equal(firstCustomer.images.length, 4);
  assert.match(firstCustomer.description, /first-customer sprint/i);
});
