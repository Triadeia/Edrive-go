import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { dashboardHero, visualAssets } from "./brand-data";

test("dashboard uses only the supplied official eDrive Go imagery", () => {
  const images = [dashboardHero, ...visualAssets];

  assert.equal(visualAssets.length, 3);
  for (const image of images) {
    assert.match(image.src, /^\/images\/edrive-go-official\/.*\.webp$/);
    assert.ok(image.alt.length > 0);
    assert.ok(existsSync(join(process.cwd(), "public", image.src)));
  }
});
