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

// Typed locally because startViewTransition isn't in every TS DOM lib yet, and
// this has to compile whether or not it is.
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// A card has to leave layout entirely for the remaining ones to close the gap,
// and a property transition can't animate that. Running the change inside a view
// transition is what makes the survivors glide into the freed cell instead of
// snapping. Unsupported or reduced-motion just gets the instant reflow.
function withReflowAnimation(apply: () => void): void {
  const doc = document as ViewTransitionDocument;
  if (prefersReducedMotion.matches || typeof doc.startViewTransition !== "function") {
    apply();
    return;
  }
  doc.startViewTransition(apply);
}

for (const checkbox of document.querySelectorAll<HTMLInputElement>(
  '[data-testid="compare-toggle"]',
)) {
  const placeId = checkbox.dataset.placeId;
  const visual = placeId ? findPlaceVisual(placeId, "compare") : null;
  if (!placeId || !visual) continue;

  // Each card needs its own name for the API to track it across the change;
  // derived from the data so it stays in step with PLACES.
  visual.style.setProperty("view-transition-name", `compare-${placeId}`);

  checkbox.addEventListener("change", () => {
    withReflowAnimation(() => {
      visual.hidden = !checkbox.checked;
    });
  });

  // Initial state matches the checkbox without animating on load.
  visual.hidden = !checkbox.checked;
}

// Autoplay: off by default, user-triggered only, and it runs to the final
// (500-year) stop rather than looping back to day 1 on its own.
const controls = document.querySelector<HTMLElement>('[data-testid="compare-controls"]');
const playButton = document.querySelector<HTMLButtonElement>('[data-testid="compare-play"]');
const pauseButton = document.querySelector<HTMLButtonElement>('[data-testid="compare-pause"]');
let playTimer: ReturnType<typeof setInterval> | null = null;

// Moves the shared slider without the drag handler reading it as a person
// grabbing the slider — which would pause the very playback that moved it.
function moveCompareTo(stopIndex: number): void {
  if (!compareSlider) return;
  isAutoAdvancing = true;
  compareSlider.value = String(sliderValueForStop(stopIndex, TIMELINE.length));
  compareSlider.dispatchEvent(new Event("input"));
  isAutoAdvancing = false;
}

function setPlaying(playing: boolean): void {
  controls?.setAttribute("data-playing", String(playing));
}

function stopPlayback(): void {
  if (playTimer !== null) {
    clearInterval(playTimer);
    playTimer = null;
  }
  setPlaying(false);
}

function startPlayback(): void {
  // Pressing Play twice should not stack a second interval on the first.
  if (!compareSlider || playTimer !== null) return;

  // At the last stop there is nothing left to play forward into, so Play means
  // "again, from the beginning" rather than doing nothing at all.
  if (compareStopIndex >= TIMELINE.length - 1) moveCompareTo(0);

  setPlaying(true);
  playTimer = setInterval(() => {
    const next = compareStopIndex + 1;
    if (next > TIMELINE.length - 1) {
      stopPlayback();
      return;
    }
    moveCompareTo(next);
  }, 1200);
}

playButton?.addEventListener("click", startPlayback);
pauseButton?.addEventListener("click", stopPlayback);

compareSlider?.addEventListener("input", () => {
  if (!isAutoAdvancing && playTimer !== null) stopPlayback();
});
