// The epilogue globe. Scroll position drives how big it is; a clock drives how
// fast it turns and where in the year it is. The two are linked, inversely: a
// distant speck races through its years, and it settles as it comes at you, so
// what starts as centuries flickering past ends as one planet turning slowly.
// That deceleration is the point of the section — the timeline above ran five
// hundred years in a few seconds, and this is the same clock slowing down to
// something a person can stand and watch.
//
// Everything visual is CSS. This file only publishes three numbers:
//   --globe-progress  0..1  how far through the section (on the section)
//   --spin            0..1  one full turn, looping (on the globe)
//   opacity           per season layer, cross-faded
//
// Scroll is never intercepted. The pinning is a sticky stage in CSS; here we
// only read the position, never fight it.

const section = document.querySelector<HTMLElement>('[data-testid="globe-section"]');
const track = document.querySelector<HTMLElement>('[data-testid="globe-track"]');
const globe = document.querySelector<HTMLElement>('[data-testid="globe"]');
const layers = [...document.querySelectorAll<HTMLElement>(".globe-map")];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

if (section && track && globe && layers.length > 0) {
  const SEASONS = layers.length;

  // Turns per second, and the small one is the *end* of the range, not the
  // start: a speck spins hard, and it settles as it comes at you. Coming to
  // rest is what makes the arrival land — a planet still racing once it fills
  // the frame reads as a loading spinner.
  const SPIN_FAR = 0.42;
  const SPIN_NEAR = 0.03;

  // How much of a screen before the track pins the globe starts surfacing in.
  const EARLY = 0.3;

  let progress = 0;
  let spin = 0;
  let yearPhase = 0;
  let lastFrame = 0;
  let rafId: number | null = null;

  function readProgress(): void {
    // Under reduced motion the progress value is pinned to 1 by hand and the
    // section is no longer tall enough to derive one from — measuring here
    // would overwrite that with 0 and take the globe's opacity down with it.
    if (reduceMotion.matches) return;

    // Measured against the track, whose height is the pinned run and nothing
    // else, so changing any of the three bands in CSS needs no change here.
    //
    // EARLY starts the clock before the track reaches the top of the screen —
    // the last of the approach is still going dark while the globe is already
    // surfacing from the bottom of the frame. The two overlap on purpose: made
    // to queue, the page sat on a finished empty sky waiting for the reader to
    // scroll again.
    const rect = track!.getBoundingClientRect();
    const early = window.innerHeight * EARLY;
    const travel = rect.height - window.innerHeight + early;
    progress = travel > 0 ? clamp((early - rect.top) / travel, 0, 1) : 0;
    section!.style.setProperty("--globe-progress", progress.toFixed(4));
  }

  // Triangular cross-fade around a ring: each layer is fully up at its own
  // point in the year and gone one season either side. Distance is measured the
  // short way round so December blends into January rather than racing back
  // through the whole year.
  function paintSeasons(phase: number): void {
    for (const [index, layer] of layers.entries()) {
      const direct = Math.abs(phase - index);
      const distance = Math.min(direct, SEASONS - direct);
      layer.style.opacity = String(Math.max(0, 1 - distance));
    }
  }

  function frame(now: number): void {
    // A tab left in the background hands back a huge first delta; capping it
    // stops the planet from teleporting a quarter-turn on return.
    const elapsed = Math.min(now - lastFrame, 100) / 1000;
    lastFrame = now;

    readProgress();

    const turnsPerSecond = SPIN_FAR + progress * (SPIN_NEAR - SPIN_FAR);
    spin = (spin + turnsPerSecond * elapsed) % 1;
    // One turn is one year, so the seasons slow down with the spin.
    yearPhase = (yearPhase + turnsPerSecond * elapsed * SEASONS) % SEASONS;

    globe!.style.setProperty("--spin", spin.toFixed(5));
    paintSeasons(yearPhase);

    rafId = requestAnimationFrame(frame);
  }

  function start(): void {
    if (rafId !== null || reduceMotion.matches) return;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stop(): void {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  // Only run while the section is actually on screen. Otherwise this would burn
  // a frame budget for the entire page, most of which is nowhere near it.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) start();
        else stop();
      }
    },
    { rootMargin: "100px" },
  );
  observer.observe(section);

  // Reduced motion gets the picture without the movement: one season, no spin,
  // and CSS pins the size. Honour a change of that setting without a reload.
  function applyMotionPreference(): void {
    if (reduceMotion.matches) {
      stop();
      section!.style.setProperty("--globe-progress", "1");
      globe!.style.setProperty("--spin", "0");
      paintSeasons(2); // summer, the most legible of the four
    } else {
      start();
    }
  }
  reduceMotion.addEventListener("change", applyMotionPreference);
  applyMotionPreference();

  // Sizes change without a scroll event, and the sticky travel depends on the
  // viewport height, so recompute rather than trust the last frame's number.
  window.addEventListener("resize", readProgress, { passive: true });
  readProgress();
}
