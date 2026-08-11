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
