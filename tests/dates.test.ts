import { describe, expect, it } from "vitest";
import {
  getCurrentWeekDateKeys,
  getLocalDateKey,
  normalizeToLocalMidnight,
} from "../src/lib/dates.js";

describe("Ho Chi Minh date helpers", () => {
  it("uses the local calendar date instead of UTC", () => {
    expect(getLocalDateKey(new Date("2026-06-18T18:00:00.000Z"))).toBe("2026-06-19");
    expect(normalizeToLocalMidnight(new Date("2026-06-19T08:00:00.000Z")).toISOString())
      .toBe("2026-06-18T17:00:00.000Z");
  });

  it("builds a Monday-to-Sunday week", () => {
    expect(getCurrentWeekDateKeys(new Date("2026-06-19T05:00:00.000Z"))).toEqual([
      "2026-06-15", "2026-06-16", "2026-06-17", "2026-06-18",
      "2026-06-19", "2026-06-20", "2026-06-21",
    ]);
  });
});
