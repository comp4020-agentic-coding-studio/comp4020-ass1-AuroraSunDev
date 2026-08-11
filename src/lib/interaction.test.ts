import { describe, expect, it } from "vitest";
import { PLACES } from "../data/places";
import { TIMELINE } from "../data/timeline";
import { getStateForPlace } from "./interaction";

describe("getStateForPlace", () => {
  for (const place of PLACES) {
    describe(place.id, () => {
      it("clamps a negative index to the first stop", () => {
        expect(getStateForPlace(place, -5)).toBe(place.stops[0]);
      });

      it("clamps an out-of-range index to the last stop", () => {
        expect(getStateForPlace(place, 999)).toBe(place.stops[place.stops.length - 1]);
      });

      it("round-trips every real stop index to that place's own stop", () => {
        for (let i = 0; i < TIMELINE.length; i++) {
          expect(getStateForPlace(place, i)).toBe(place.stops[i]);
        }
      });
    });
  }
});
