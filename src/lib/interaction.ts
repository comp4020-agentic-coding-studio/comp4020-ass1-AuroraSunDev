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

// The timeline slider is a single fine-grained continuous input
// (0..SLIDER_RESOLUTION), decoupled from both the 7 evidence-grounded
// TIMELINE stops and the 10 photo frames per place. Bucketing it two
// different ways — one coarser (stops), one finer (frames) — is what makes
// dragging feel continuous without expanding the evidence-grounded stop
// count to match the photo count.
export const SLIDER_RESOLUTION = 1000;
export const FRAME_COUNT = 10;

export function stopIndexFromSlider(value: number, stopCount: number): number {
  return Math.round((value / SLIDER_RESOLUTION) * (stopCount - 1));
}

export function frameIndexFromSlider(value: number): number {
  return Math.round((value / SLIDER_RESOLUTION) * (FRAME_COUNT - 1)) + 1;
}

export function sliderValueForStop(stopIndex: number, stopCount: number): number {
  return Math.round((stopIndex / (stopCount - 1)) * SLIDER_RESOLUTION);
}
