import { TIMELINE } from "../data/timeline";
import { PLACES } from "../data/places";
import type { Place } from "../data/places";
import {
  FRAME_COUNT,
  frameIndexFromSlider,
  getStateForPlace,
  sliderValueForStop,
  stopIndexFromSlider,
} from "../lib/interaction";
import { sceneFrameUrl } from "../lib/asset-url";

function bindTimeSlider(
  scope: string,
  onChange: (sliderValue: number) => void,
): HTMLInputElement | null {
  const slider = document.querySelector<HTMLInputElement>(
    `[data-testid="time-slider"][data-scope="${scope}"]`,
  );
  const readout = document.querySelector<HTMLElement>(
    `[data-testid="time-readout"][data-scope="${scope}"]`,
  );
  const tickList = document.querySelector<HTMLOListElement>(
    `.time-slider-ticks[data-scope="${scope}"]`,
  );
  if (!slider) return null;
  const update = () => {
    const sliderValue = Number(slider.value);
    const stopIndex = stopIndexFromSlider(sliderValue, TIMELINE.length);
    if (readout) readout.textContent = TIMELINE[stopIndex]?.label ?? "";
    if (tickList) {
      tickList.querySelectorAll("li").forEach((tick, index) => {
        tick.classList.toggle("is-active", index === stopIndex);
      });
    }
    onChange(sliderValue);
  };
  slider.addEventListener("input", update);
  update();
  return slider;
}

function findPlaceVisual(placeId: string, scope: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `[data-testid="place-visual"][data-place-id="${placeId}"][data-scope="${scope}"]`,
  );
}

function renderVisual(place: Place, scope: string, sliderValue: number): void {
  const container = findPlaceVisual(place.id, scope);
  if (!container) return;
  const stopIndex = stopIndexFromSlider(sliderValue, TIMELINE.length);
  const frameIndex = frameIndexFromSlider(sliderValue);
  const stop = getStateForPlace(place, stopIndex);

  const label = container.querySelector<HTMLElement>('[data-testid="place-visual-label"]');
  if (label) label.textContent = stop.label;
  const description = container.querySelector<HTMLElement>(
    '[data-testid="place-visual-description"]',
  );
  if (description) description.textContent = stop.description;

  const frame = container.querySelector<HTMLImageElement>('[data-testid="place-illustration"]');
  if (frame) {
    const src = sceneFrameUrl(place.id, frameIndex);
    if (frame.src !== src) frame.src = src;
  }
}

// Every scene frame is preloaded once at page load so dragging any slider
// never waits on a network fetch — that's what keeps the drag feeling silky.
for (const place of PLACES) {
  for (let frameIndex = 1; frameIndex <= FRAME_COUNT; frameIndex++) {
    const image = new Image();
    image.src = sceneFrameUrl(place.id, frameIndex);
  }
}

// Individual sections: each place's own slider only ever updates that
// place's own visual, never another section's.
for (const place of PLACES) {
  bindTimeSlider(place.id, (sliderValue) => renderVisual(place, place.id, sliderValue));
}

// Comparison section: the shared slider updates all 4 comparison visuals
// together, regardless of which are currently checked. Checkboxes only
// toggle visibility, so toggling one never resets or recomputes the time.
let compareStopIndex = 0;
let isAutoAdvancing = false;

const compareSlider = bindTimeSlider("compare", (sliderValue) => {
  compareStopIndex = stopIndexFromSlider(sliderValue, TIMELINE.length);
  for (const place of PLACES) renderVisual(place, "compare", sliderValue);
});

for (const checkbox of document.querySelectorAll<HTMLInputElement>(
  '[data-testid="compare-toggle"]',
)) {
  const placeId = checkbox.dataset.placeId;
  const visual = placeId ? findPlaceVisual(placeId, "compare") : null;
  const sync = () => {
    if (visual) visual.hidden = !checkbox.checked;
  };
  checkbox.addEventListener("change", sync);
  sync();
}

// Autoplay: off by default, user-triggered only, and stops at the final
// (500-year) stop rather than looping back to day 1.
const playButton = document.querySelector<HTMLButtonElement>('[data-testid="compare-play"]');
let playTimer: ReturnType<typeof setInterval> | null = null;

function stopPlayback(): void {
  if (playTimer !== null) {
    clearInterval(playTimer);
    playTimer = null;
  }
  playButton?.setAttribute("aria-pressed", "false");
}

function startPlayback(): void {
  if (!compareSlider) return;
  playButton?.setAttribute("aria-pressed", "true");
  playTimer = setInterval(() => {
    const next = compareStopIndex + 1;
    if (next > TIMELINE.length - 1) {
      stopPlayback();
      return;
    }
    isAutoAdvancing = true;
    compareSlider.value = String(sliderValueForStop(next, TIMELINE.length));
    compareSlider.dispatchEvent(new Event("input"));
    isAutoAdvancing = false;
  }, 1200);
}

playButton?.addEventListener("click", () => {
  if (playTimer !== null) {
    stopPlayback();
  } else {
    startPlayback();
  }
});

compareSlider?.addEventListener("input", () => {
  if (!isAutoAdvancing && playTimer !== null) stopPlayback();
});
