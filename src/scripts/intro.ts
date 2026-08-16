import { assetUrl } from "../lib/asset-url";

// Nothing plays until the visitor clicks "vanish", so landing here costs no
// waiting. Once clicked the sequence is: the burst expands from the click
// point, the screen goes white, one line surfaces and fades, then the
// explainer. Reduced-motion keeps the same beats at a fraction of the length.
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const BOOM_MS = REDUCED ? 400 : 2_000;
const WHITE_MS = REDUCED ? 200 : 600;

// The line is the only text in the sequence and it gets read once. The
// keyframes spend 26% of this arriving and 26% leaving, holding it fully
// opaque for the 48% between — about 2.4s of reading at this length, with
// ~1.3s of fade either side. Both ends are deliberately slow, so the run has
// to be long enough to pay for them and still leave the reading time intact.
const LINE_MS = REDUCED ? 2_600 : 5_000;

const EXPLAINER = assetUrl("explainer.html");

const stage = document.querySelector<HTMLElement>('[data-testid="intro-stage"]');
const trigger = document.querySelector<HTMLButtonElement>('[data-testid="vanish-trigger"]');
const boom = document.querySelector<HTMLElement>('[data-testid="intro-boom"]');

const timers: number[] = [];
let running = false;

function goToExplainer(): void {
  window.location.href = EXPLAINER;
}

// Escape jumps straight through, for anyone who has seen it once already.
function skip(): void {
  for (const timer of timers) window.clearTimeout(timer);
  timers.length = 0;
  goToExplainer();
}

function erupt(originX: number, originY: number): void {
  if (running || !stage || !boom) return;
  running = true;

  // Warm the next page while the expansion plays, so the hand-off is instant.
  const prefetch = document.createElement("link");
  prefetch.rel = "prefetch";
  prefetch.href = EXPLAINER;
  document.head.append(prefetch);

  boom.style.setProperty("--boom-x", `${originX}px`);
  boom.style.setProperty("--boom-y", `${originY}px`);
  boom.classList.add("is-erupting");

  // On the stage, not on the burst: the white-out is a sibling and has to time
  // itself against the same duration so it can rise underneath the burst.
  stage.style.setProperty("--boom-duration", `${BOOM_MS}ms`);
  stage.style.setProperty("--line-duration", `${LINE_MS}ms`);
  stage.dataset.phase = "boom";

  timers.push(
    window.setTimeout(() => {
      stage.dataset.phase = "white";
    }, BOOM_MS),
  );
  timers.push(
    window.setTimeout(() => {
      stage.dataset.phase = "line";
    }, BOOM_MS + WHITE_MS),
  );
  timers.push(window.setTimeout(goToExplainer, BOOM_MS + WHITE_MS + LINE_MS));
}

trigger?.addEventListener("click", (event) => {
  // Latch the cap down. :active already handles the live press, but it ends on
  // mouse-up — exactly when the sequence starts — so without this the button
  // would spring back up and then fade out, which reads as it recovering
  // rather than as having been pushed in. Set on click rather than pointerdown
  // so a press dragged off the button leaves nothing stuck.
  trigger.dataset.pressed = "";

  // Keyboard activation reports a 0,0 pointer position — fall back to the
  // button's own centre so the burst still starts at the figure either way.
  const fromPointer = event.clientX !== 0 || event.clientY !== 0;
  const rect = trigger.getBoundingClientRect();
  erupt(
    fromPointer ? event.clientX : rect.left + rect.width / 2,
    fromPointer ? event.clientY : rect.top + rect.height / 2,
  );
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && running) skip();
});
