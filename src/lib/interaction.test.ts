import { describe, expect, it } from "vitest";
import { PLACES } from "../data/places";
import { TIMELINE } from "../data/timeline";
import {
  FRAME_COUNT,
  SLIDER_RESOLUTION,
  frameIndexFromSlider,
  getStateForPlace,
  sliderValueForStop,
  stopIndexFromSlider,
} from "./interaction";

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

describe("slider bucketing: one continuous input, two independent buckets", () => {
  it("maps the slider's ends to the first and last timeline stop", () => {
    expect(stopIndexFromSlider(0, TIMELINE.length)).toBe(0);
    expect(stopIndexFromSlider(SLIDER_RESOLUTION, TIMELINE.length)).toBe(TIMELINE.length - 1);
  });

  it("maps the slider's ends to the first and last photo frame", () => {
    expect(frameIndexFromSlider(0)).toBe(1);
    expect(frameIndexFromSlider(SLIDER_RESOLUTION)).toBe(FRAME_COUNT);
  });

  it("never produces a stop index outside the timeline", () => {
    for (let value = 0; value <= SLIDER_RESOLUTION; value += 17) {
      const stopIndex = stopIndexFromSlider(value, TIMELINE.length);
      expect(stopIndex).toBeGreaterThanOrEqual(0);
      expect(stopIndex).toBeLessThan(TIMELINE.length);
    }
  });

  it("never produces a frame index outside 1..FRAME_COUNT", () => {
    for (let value = 0; value <= SLIDER_RESOLUTION; value += 13) {
      const frameIndex = frameIndexFromSlider(value);
      expect(frameIndex).toBeGreaterThanOrEqual(1);
      expect(frameIndex).toBeLessThanOrEqual(FRAME_COUNT);
    }
  });

  it("updates the frame bucket more often than the stop bucket while dragging", () => {
    const frameChanges = new Set<number>();
    const stopChanges = new Set<number>();
    for (let value = 0; value <= SLIDER_RESOLUTION; value++) {
      frameChanges.add(frameIndexFromSlider(value));
      stopChanges.add(stopIndexFromSlider(value, TIMELINE.length));
    }
    expect(frameChanges.size).toBeGreaterThan(stopChanges.size);
  });

  it("sliderValueForStop is the inverse used by autoplay: it lands back on the same stop", () => {
    for (let i = 0; i < TIMELINE.length; i++) {
      const value = sliderValueForStop(i, TIMELINE.length);
      expect(stopIndexFromSlider(value, TIMELINE.length)).toBe(i);
    }
  });
});
