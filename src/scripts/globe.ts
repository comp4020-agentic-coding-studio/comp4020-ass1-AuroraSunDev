// The epilogue globe. Scroll position drives how big it is; a clock drives how
// fast it turns and where in the year it is. The two are linked: the further in
// you scroll, the faster the planet spins, so the seasons blur past as it
// arrives — which is the whole point of the section.
//
// Everything visual is CSS. This file only publishes three numbers:
//   --globe-progress  0..1  how far through the section (on the section)
//   --spin            0..1  one full turn, looping (on the globe)
//   opacity           per season layer, cross-faded
//
// Scroll is never intercepted. The pinning is a sticky stage in CSS; here we
// only read the position, never fight it.

const section = document.querySelector<HTMLElement>('[data-testid="globe-section"]');
const globe = document.querySelector<HTMLElement>('[data-testid="globe"]');
const layers = [...document.querySelectorAll<HTMLElement>(".globe-map")];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

if (section && globe && layers.length > 0) {
  const SEASONS = layers.length;

  // Turns per second. The floor is what it does while still far away — slow
  // enough to read as a planet rather than a spinning ball; the ceiling is what
  // it reaches once it fills the frame.
  const SLOWEST = 0.035;
  const FASTEST = 0.4;

  let progress = 0;
  let spin = 0;
  let yearPhase = 0;
  let lastFrame = 0;
  let rafId: number | null = null;

  function readProgress(): void {
    const rect = section!.getBoundingClientRect();
    // How far the sticky stage can travel before the section leaves.
    const travel = rect.height - window.innerHeight;
    progress = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;
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

    const turnsPerSecond = SLOWEST + progress * (FASTEST - SLOWEST);
    spin = (spin + turnsPerSecond * elapsed) % 1;
    // One turn is one year, so the seasons accelerate with the spin.
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
