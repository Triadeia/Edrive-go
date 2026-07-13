import assert from "node:assert/strict";
import test from "node:test";

import {
  bahiaDateKey,
  bahiaWallClock,
  isoFromBahiaWallClock,
  moveBahiaDatePreservingTime,
} from "./workspace-dates";

test("keeps late-night deadlines on the correct America/Bahia calendar day", () => {
  const lateNight = "2026-07-19T02:00:00.000Z";
  assert.equal(bahiaDateKey(lateNight), "2026-07-18");
  assert.equal(bahiaWallClock(lateNight), "2026-07-18T23:00");
  assert.equal(isoFromBahiaWallClock("2026-07-18T23:00"), lateNight);
});

test("moves a deadline date while preserving its Bahia wall-clock hour", () => {
  const moved = moveBahiaDatePreservingTime("2026-07-19T02:00:00.000Z", "2026-07-20");
  assert.equal(bahiaDateKey(moved), "2026-07-20");
  assert.equal(bahiaWallClock(moved), "2026-07-20T23:00");
});
