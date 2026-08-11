import { TIMELINE } from "../data/timeline";
import { PLACES } from "../data/places";
import type { Place, NycVisual, WallVisual, NuclearVisual, RainforestVisual } from "../data/places";
import { getStateForPlace } from "../lib/interaction";

function bindTimeSlider(
  scope: string,
  onChange: (stopIndex: number) => void,
): HTMLInputElement | null {
  const slider = document.querySelector<HTMLInputElement>(
    `[data-testid="time-slider"][data-scope="${scope}"]`,
  );
  const readout = document.querySelector<HTMLElement>(
    `[data-testid="time-readout"][data-scope="${scope}"]`,
  );
  if (!slider) return null;
  const update = () => {
    const stopIndex = Number(slider.value);
    if (readout) readout.textContent = TIMELINE[stopIndex]?.label ?? "";
    onChange(stopIndex);
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

function updateNycVisual(root: Element, visual: NycVisual): void {
  const water = root.querySelector<SVGRectElement>('[data-part="water"]');
  const height = (visual.waterLevel / 100) * 140;
  water?.setAttribute("y", String(140 - height));
  water?.setAttribute("height", String(height));
  root
    .querySelector<SVGGElement>('[data-part="vegetation"]')
    ?.setAttribute("opacity", String(visual.vegetation / 100));
  root
    .querySelector<SVGRectElement>('[data-part="damage"]')
    ?.setAttribute("opacity", String((visual.structuralDamage / 100) * 0.6));
}

function updateWallVisual(root: Element, visual: WallVisual): void {
  root
    .querySelector<SVGGElement>('[data-part="vegetation"]')
    ?.setAttribute("opacity", String(visual.vegetation / 100));
  root
    .querySelector<SVGGElement>('[data-part="erosion"]')
    ?.setAttribute("opacity", String(visual.erosion / 100));
  const gapCount = Math.min(4, Math.round(visual.missingSections / 25));
  root.querySelectorAll<SVGRectElement>('[data-part="gap"]').forEach((gap, i) => {
    gap.setAttribute("opacity", i < gapCount ? "1" : "0");
  });
}

const STATUS_COLOR: Record<NuclearVisual["systemStatus"], string> = {
  operating: "#2e9e44",
  "auto-shutdown": "#e0b400",
  "backup-power": "#e07b00",
  "cooling-lost": "#c62828",
  "long-term-containment": "#6b7280",
};

const STATUS_LABEL: Record<NuclearVisual["systemStatus"], string> = {
  operating: "Operating",
  "auto-shutdown": "Auto shutdown",
  "backup-power": "Backup power",
  "cooling-lost": "Cooling lost",
  "long-term-containment": "Long-term containment",
};

function updateNuclearVisual(root: Element, visual: NuclearVisual): void {
  root
    .querySelector<SVGRectElement>('[data-part="periphery-weathering"]')
    ?.setAttribute("opacity", String(visual.peripheralWeathering / 100));
  root
    .querySelector<SVGPathElement>('[data-part="containment-weathering"]')
    ?.setAttribute("opacity", String((visual.containmentWeathering / 100) * 0.6));
  root
    .querySelector<SVGCircleElement>('[data-part="status-dot"]')
    ?.setAttribute("fill", STATUS_COLOR[visual.systemStatus]);
  const label = root.querySelector<SVGTextElement>('[data-part="status-label"]');
  if (label) label.textContent = STATUS_LABEL[visual.systemStatus];
}

function updateRainforestVisual(root: Element, visual: RainforestVisual): void {
  root
    .querySelector<SVGPathElement>('[data-part="canopy-secondary"]')
    ?.setAttribute("opacity", String(visual.canopyChange / 100));
  root
    .querySelector<SVGGElement>('[data-part="wildlife"]')
    ?.setAttribute("opacity", String(visual.wildlifeVisibility / 100));
}

function renderVisual(place: Place, scope: string, stopIndex: number): void {
  const container = findPlaceVisual(place.id, scope);
  if (!container) return;
  const stop = getStateForPlace(place, stopIndex);

  const label = container.querySelector<HTMLElement>('[data-testid="place-visual-label"]');
  if (label) label.textContent = stop.label;
  const description = container.querySelector<HTMLElement>(
    '[data-testid="place-visual-description"]',
  );
  if (description) description.textContent = stop.description;

  switch (place.id) {
    case "nyc":
      updateNycVisual(container, stop.visual as NycVisual);
      break;
    case "wall":
      updateWallVisual(container, stop.visual as WallVisual);
      break;
    case "nuclear":
      updateNuclearVisual(container, stop.visual as NuclearVisual);
      break;
    case "rainforest":
      updateRainforestVisual(container, stop.visual as RainforestVisual);
      break;
  }
}

// Individual sections: each place's own slider only ever updates that
// place's own visual, never another section's.
for (const place of PLACES) {
  bindTimeSlider(place.id, (stopIndex) => renderVisual(place, place.id, stopIndex));
}

// Comparison section: the shared slider updates all 4 comparison visuals
// together, regardless of which are currently checked. Checkboxes only
// toggle visibility, so toggling one never resets or recomputes the time.
let compareStopIndex = 0;
let isAutoAdvancing = false;

const compareSlider = bindTimeSlider("compare", (stopIndex) => {
  compareStopIndex = stopIndex;
  for (const place of PLACES) renderVisual(place, "compare", stopIndex);
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
    compareSlider.value = String(next);
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
