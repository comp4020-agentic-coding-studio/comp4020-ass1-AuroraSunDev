import { TIMELINE } from "../data/timeline";
import type { Place } from "../data/places";

export function clampStopIndex(stopIndex: number): number {
  return Math.min(Math.max(0, stopIndex), TIMELINE.length - 1);
}

export function getStateForPlace<P extends Place>(
  place: P,
  stopIndex: number,
): P["stops"][number] {
  return place.stops[clampStopIndex(stopIndex)];
}

// The slider is one fine-grained continuous input (0..SLIDER_RESOLUTION)
// rather than ten discrete steps, so dragging feels continuous instead of
// notched. It is bucketed down to a stop index for the text.
export const SLIDER_RESOLUTION = 1000;
export const FRAME_COUNT = 10;

export function stopIndexFromSlider(value: number, stopCount: number): number {
  return Math.round((value / SLIDER_RESOLUTION) * (stopCount - 1));
}

// A stop and a frame are now the same moment — ten of each, in the same order —
// so the frame is derived from the stop rather than bucketed separately. Two
// independent bucketings is exactly how the caption and the drawing drifted
// apart before, and deriving one from the other makes that undrawable.
export function frameIndexFromSlider(value: number): number {
  return stopIndexFromSlider(value, FRAME_COUNT) + 1;
}

export function sliderValueForStop(stopIndex: number, stopCount: number): number {
  return Math.round((stopIndex / (stopCount - 1)) * SLIDER_RESOLUTION);
}
