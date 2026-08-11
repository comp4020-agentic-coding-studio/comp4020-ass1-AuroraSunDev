# "When Humans Vanish" — Assignment 1 implementation plan

## Context

Assignment 1 asks for a static, client-side interactive explainer: one strong
idea, one dataset or mechanic, nothing else. The idea: human absence isn't
uniform decay — a place's response depends on how much its current condition
relies on continuous human maintenance. The site is structured in two stages:
first explain each of four places on its own (why it responds the way it
does), then let the visitor compare any subset of them at the same moment in
time. **Time is the one shared variable** — a slider reused identically
throughout — not a universal "how much has this changed" score; each place's
visual response to that shared time value is its own, place-specific thing.
The checkbox selector in the comparison stage only chooses which places are
shown, it isn't a second way of interacting.

The four places, deliberately not filling every point on a dependency
spectrum but chosen as sharp, well-known contrasts:
- **NYC subway** — dependency: high, trajectory: decline (fast, steep)
- **Nuclear power plant** — dependency: high, trajectory: compound (its
  human-tended systems fail fast; its containment structure endures — a
  genuine two-speed story, shown directly in its illustration, see Visual
  design below)
- **The Great Wall of China** — dependency: low, trajectory: decline (slow,
  centuries-scale)
- **Tropical rainforest, real and undisturbed** — dependency: low,
  trajectory: independent. Precise framing matters here: this is **not** a
  place with *no* dependence on humans at all (some real ecosystems carry
  indirect human influence — hunting pressure, climate effects, edge effects).
  The claim is narrower: it has very low *direct* dependence on continuous
  human *maintenance*, so removing that maintenance doesn't trigger the kind
  of rapid response seen in built infrastructure. What change it does show
  runs on its own, much slower ecological clock — not caused by the humans
  leaving.

Repo: `/Users/aurora/Desktop/26S2/COMP8020/code/comp4020-ass1-AuroraSunDev`
(Astro, static output, vanilla TS, no framework).

## Narrative structure

```
INTRO (thesis, 2-3 sentences)
  ↓
NYC section:        explanation → own timeline slider → own visual
GREAT WALL section: explanation → own timeline slider → own visual
NUCLEAR section:     explanation → own timeline slider → own visual
RAINFOREST section:  explanation → own timeline slider → own visual
  ↓
COMPARE section: checkboxes (select any subset) → shared timeline slider
                 (+ optional play, default paused) → selected places' compact
                 visuals side by side, all showing the SAME moment in time
```

Each individual section answers "why does this place change this way?" The
comparison section answers "given the same span of time, how differently do
these respond?"

Each of the 4 sections follows the same rhythm: place name (h2) → a short
explanation grouped as its lead paragraph (the `mechanism`/`contrast` text,
answering "why") → a visually set-apart timeline block (slider + illustration
+ caption, answering "what does that look like"). Consistent rhythm, not
consistent artwork — each place's illustration changes along its own
dimensions (see Visual design).

## Data model

`src/data/timeline.ts` — unchanged, 7 shared stops. This is the one thing
every place and every slider (individual or shared) has in common:

```ts
export interface TimeStop { id: string; label: string; }
export const TIMELINE: readonly TimeStop[] = [
  { id: "day-1", label: "1 day" }, { id: "week-1", label: "1 week" },
  { id: "month-1", label: "1 month" }, { id: "year-1", label: "1 year" },
  { id: "year-10", label: "10 years" }, { id: "year-100", label: "100 years" },
  { id: "year-500", label: "500 years" },
];
```

`src/data/sources.ts` — a small, flat map of the real sources checked while
writing this content. Referenced by id from each stop's evidence (below), and
mechanically verified to exist (see Tests) so a claim can never point at a
citation that isn't there:

```ts
export interface Source { id: string; title: string; url: string; }
export const SOURCES: Record<string, Source> = {
  "mta-daily-pumping": { title: "NYU Wagner — Building Flood Resilience into the NYC Subway", url: "https://wagner.nyu.edu/rudincenter/2022/09/building-flood-resilience-nyc-subway" },
  "sandy-flooding": { title: "CBS New York — pumping flooded tunnels could take 4 days", url: "https://www.cbsnews.com/newyork/news/mta-salt-water-in-subways-could-mean-long-major-repairs/" },
  "great-wall-loss": { title: "TIME — China's Great Wall Is Crumbling Away", url: "https://time.com/3941018/china-great-wall-decay-crumbling-missing/" },
  "great-wall-gansu-erosion": { title: "NBC News — Sandstorms eating away at China's Great Wall", url: "https://www.nbcnews.com/id/wbna20492488" },
  "nrc-scram": { title: "NRC — Backgrounder on the Three Mile Island Accident", url: "https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/3mile-isle" },
  "unmanned-reactor-estimate": { title: "ScienceABC — How Long Can Nuclear Reactors Run Without Human Interference?", url: "https://www.scienceabc.com/eyeopeners/how-long-can-nuclear-reactors-run-without-human-interference.html" },
  "containment-design-life": { title: "ORNL — Nuclear Power Plant Concrete Structures", url: "https://www.ornl.gov/publication/nuclear-power-plant-concrete-structures" },
  "forest-succession-recovery": { title: "PMC — Incomplete recovery of tree community composition after 120 years of tropical forest succession in Panama", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10952663/" },
  "tree-longevity": { title: "PNAS — Global tree-ring analysis reveals rapid decrease in tropical tree longevity with temperature", url: "https://www.pnas.org/doi/10.1073/pnas.2003873117" },
};
```

`src/data/places.ts` — the core rework. No more single `transformation:
0-100`. Each place has its own visual-state shape, and every claim carries the
evidence backing it:

```ts
export type Trajectory = "decline" | "compound" | "independent";
export type DependencyLevel = "high" | "medium" | "low";

// evidence describes THIS STOP'S CLAIM about this scenario — not the
// underlying source. "observed" is reserved for states that are true of the
// real place RIGHT NOW, independent of the human-vanish premise (e.g. "no
// visible change" is trivially true today too; a currently-unmaintained wall
// segment's condition is a real, present fact). Every future-projected or
// scenario-specific claim is "inferred", even when it leans on a strong
// real-world precedent — a documented historical fact does not make a
// hypothetical future state itself documented.
export interface Evidence {
  evidence: "observed" | "inferred";
  sourceIds: string[];        // keys into SOURCES; [] if reasoning has no single citable source
  qualification?: string;     // states the reasoning gap explicitly, e.g. "analogy, not a case study of this scenario"
}

interface StopBase extends Evidence {
  label: string;        // short badge, e.g. "Substantially flooded"
  description: string;  // one sentence
}

export interface NycVisual { waterLevel: number; vegetation: number; structuralDamage: number; } // each 0-100
export interface WallVisual { vegetation: number; erosion: number; missingSections: number; }     // each 0-100
export type ReactorStatus = "operating" | "auto-shutdown" | "backup-power" | "cooling-lost" | "long-term-containment";
export interface NuclearVisual { systemStatus: ReactorStatus; peripheralWeathering: number; containmentWeathering: number; } // weathering 0-100
export interface RainforestVisual { canopyChange: number; wildlifeVisibility: number; } // each 0-100, low ceiling

interface PlaceOf<V> {
  id: string;
  name: string;
  dependency: DependencyLevel;
  trajectory: Trajectory;
  mechanism: string; // why THIS place depends on humans this way
  contrast: string;  // how its trajectory differs from the others
  stops: (StopBase & { visual: V })[]; // same length/order as TIMELINE
}

export type Place =
  | PlaceOf<NycVisual>
  | PlaceOf<WallVisual>
  | PlaceOf<NuclearVisual>
  | PlaceOf<RainforestVisual>;

export const PLACES: readonly Place[] = [ /* 4 entries, below */ ];
```

`getStateForPlace(place, stopIndex)` in `src/lib/interaction.ts` is unchanged
in shape — clamps the index and returns `place.stops[i]` — but what it returns
now carries a place-specific `visual` object instead of one shared number.

### The four places (content)

**NYC subway** — dependency: high, trajectory: decline
mechanism: "The city's tunnels sit below the water table; keeping them dry,
powered, and signaled takes continuous, active work."
contrast: "Nothing else here changes this fast — most of the transformation
happens within the first year, not over centuries."

| Stop | visual (waterLevel / vegetation / structuralDamage) | evidence | sourceIds | Label / Description |
|---|---|---|---|---|
| 1 day | 5 / 0 / 2 | inferred | mta-daily-pumping | qualification: "extrapolated from today's continuous pumping requirement — no real case of NYC's pumps actually stopping." — **Pumps silent.** Even on an ordinary dry day the system pumps roughly 10-13 million gallons of groundwater out daily; that stops immediately, and water starts rising the same day. |
| 1 week | 25 / 0 / 5 | inferred | mta-daily-pumping, sandy-flooding | **Low sections filling.** At that same seepage rate, the lowest-lying tunnels are accumulating serious standing water within days. |
| 1 month | 55 / 3 / 15 | inferred | mta-daily-pumping, sandy-flooding | qualification: "real storm-flood events show partial flooding when pumps are overwhelmed; full, permanent pump loss is inferred to be worse, not itself observed." — **Substantially flooded.** Most below-water-table sections are underwater; drier upper sections start showing rust and early plant growth. |
| 1 year | 75 / 10 / 40 | inferred | mta-daily-pumping | **Systems corroding.** Standing water and open air are destroying rails, third-rail power, and signaling electronics. |
| 10 years | 85 / 25 / 65 | inferred | [] | qualification: "reasoned by analogy with other abandoned flooded infrastructure; no specific cited case." — **Structurally failing.** Freeze-thaw and water pressure are collapsing weaker sections. |
| 100 years | 90 / 40 / 85 | inferred | [] | **Mostly collapsed.** Flood-prone tunnels are largely collapsed voids; drier sections retain more structure. |
| 500 years | 92 / 55 / 95 | inferred | [] | qualification: "beyond any direct evidence; reasoned from general material-degradation timescales, not a documented case." — **Barely legible.** Little of the flood-exposed network survives as open tunnel. |

**The Great Wall of China** — dependency: low, trajectory: decline
mechanism: "Built to endure with little upkeep — but not none: real
unmaintained sections are crumbling right now, not hypothetically."
contrast: "The slowest of the four by far, and its later states aren't a
guess — comparable unmaintained sections already exist today."

| Stop | visual (vegetation / erosion / missingSections) | evidence | sourceIds | Label / Description |
|---|---|---|---|---|
| 1 day | 0 / 0 / 0 | observed | [] | **No visible change.** True today regardless of the premise — this structure doesn't change on a scale of days. |
| 1 week | 0 / 0 / 0 | observed | [] | **No visible change.** Same as a day earlier. |
| 1 month | 2 / 1 / 0 | observed | [] | **Quietly unvisited.** No structural change yet; without tourists or vendors, nearby paths go unused. |
| 1 year | 8 / 3 / 0 | inferred | great-wall-loss | qualification: "extrapolated from typical reports of vegetation establishing in unmaintained mortar joints." — **Cracks take root.** |
| 10 years | 20 / 15 / 2 | inferred | great-wall-gansu-erosion | qualification: "calibrated against a real reported case (~25 miles of exposed wall eroded to mounds of dirt within ~20 years in Gansu) but applied here by analogy, not as a direct observation of this wall segment." — **Exposed sections erode fast.** |
| 100 years | 35 / 40 / 20 | inferred | great-wall-loss | qualification: "calibrated against the present-day ~30% overall loss figure — itself the product of centuries of mixed, uneven maintenance history, used here only as an order-of-magnitude analogy." — **Uneven survival.** Weaker construction is failing much faster than well-built stone sections. |
| 500 years | 45 / 65 / 45 | inferred | great-wall-loss | qualification: "the real pre-Ming wall has been unmaintained for a comparably long span and is reported as 'almost entirely disappeared' — the closest available analogy, not a direct observation of this scenario." — **What already happens to old sections.** |

**Nuclear power plant** — dependency: high, trajectory: compound
mechanism: "Its safety and cooling systems need continuous power and
attention; its containment structure was engineered for a multi-decade
service life largely independent of day-to-day upkeep."
contrast: "It changes almost as fast as the subway at first, but plateaus
much lower — the one place here where fast collapse and long endurance
happen at the same time, in different parts of the same site."

| Stop | visual (systemStatus / peripheralWeathering / containmentWeathering) | evidence | sourceIds | Label / Description |
|---|---|---|---|---|
| 1 day | auto-shutdown / 2 / 0 | inferred | nrc-scram | qualification: "SCRAM and the switch to backup power are real, regularly-tested reactor behavior — but applying that behavior to this specific human-disappearance scenario is still a projection onto a case that hasn't happened, not itself an observed outcome." — **Automatic shutdown.** Reactors are designed to SCRAM (automatic emergency shutdown) on their own; the plant switches to backup diesel power. |
| 1 week | backup-power / 5 / 0 | inferred | unmanned-reactor-estimate | qualification: "a published estimate for a fully unattended plant, not a documented case of one actually left unattended this long." — **Backup power the bottleneck.** |
| 1 month | cooling-lost / 15 / 1 | inferred | unmanned-reactor-estimate, nrc-scram | qualification: "real station-blackout events show fuel damage can begin once cooling is lost this long, but outcomes are highly design-dependent." — **Cooling lost.** |
| 1 year | cooling-lost / 30 / 2 | inferred | [] | **Containment endures.** Whatever happens to the fuel and cooling systems has typically played out within the first year; the structure remains standing regardless. |
| 10 years | long-term-containment / 55 / 4 | inferred | containment-design-life | qualification: "containment structures are licensed/engineered for roughly 40-60 years of service life — this stop is well within that, but the plant is no longer being licensed or inspected, so this is reasoned, not a design-life guarantee." — **Two speeds, one site.** |
| 100 years | long-term-containment / 75 / 8 | inferred | containment-design-life | qualification: "well beyond any structure's documented design life (~40-60 years); reasoned from general concrete-durability engineering, not an industry claim about this timescale." — **Structure outlasts function.** |
| 500 years | long-term-containment / 88 / 15 | inferred | containment-design-life | qualification: "far beyond any real design-life figure or observed case; a general engineering extrapolation, held deliberately modest (containmentWeathering stays low) rather than asserting precise survival." — **A concrete monument.** |

**Tropical rainforest, real and undisturbed** — dependency: low, trajectory: independent
mechanism: "This forest's current condition already reflects centuries of its
own ecological cycles rather than active upkeep — it has very low *direct*
dependence on continuous human maintenance, unlike a subway system or a power
plant."
contrast: "Because its condition was never propped up by continuous
maintenance in the first place, removing that maintenance doesn't trigger the
kind of rapid change seen in built infrastructure — what change does happen
here runs on the forest's own, much slower clock."

| Stop | visual (canopyChange / wildlifeVisibility) | evidence | sourceIds | Label / Description |
|---|---|---|---|---|
| 1 day | 0 / 0 | observed | [] | **Unchanged.** Indistinguishable from any other day. |
| 1 week | 0 / 1 | observed | [] | **Unchanged.** The forest's normal cycles continue exactly as before. |
| 1 month | 1 / 2 | observed | [] | **Quieter, not different.** The only real difference is what's absent nearby, if anything ever was. |
| 1 year | 2 / 4 | inferred | [] | qualification: "some studies document human-avoidant species becoming more visible when human presence drops; effect size varies a lot by site and species, and this forest was already relatively undisturbed." — **Slightly bolder wildlife.** |
| 10 years | 4 / 6 | inferred | tree-longevity | **Its own clock.** Tropical forest turnover is generally estimated at under ~400 years, driven by storms, tree deaths, and succession that were already running before anyone was nearby. |
| 100 years | 8 / 8 | inferred | forest-succession-recovery | qualification: "a long-term Panama study found forest structure recovers to old-growth levels by ~90 years after a disturbance, but full community composition can take much longer — used here as an order-of-magnitude reference, not a claim about this specific forest." — **Turned over, not transformed.** |
| 500 years | 13 / 10 | inferred | tree-longevity, forest-succession-recovery | qualification: "within known tropical forest turnover timescales, but no study observes any one forest over a literal 500-year unvisited window — reasoned extrapolation." — **Governed by itself.** Canopy generations have turned over on the forest's own ecological terms, not because anyone left. |

## Components

- `src/data/sources.ts`, `src/data/timeline.ts`, `src/data/places.ts` — data,
  as above.
- `src/lib/interaction.ts` — `getStateForPlace(place, stopIndex)`, same
  clamping logic as before; return type now includes a place-specific
  `visual` object.
- `src/components/TimeSlider.astro` — props `{ scope: string }`. Renders the
  range input (`data-testid="time-slider" data-scope={scope}`), the 7 tick
  labels, and a live readout (`data-testid="time-readout" data-scope={scope}`,
  `role="status" aria-live="polite"`). Used 5 times: `scope="nyc"`, `"wall"`,
  `"nuclear"`, `"rainforest"`, `"compare"`.
- `src/components/visuals/{Nyc,Wall,Nuclear,Rainforest}Visual.astro` — one
  small inline SVG per place, each rendering its *own* visual dimensions (see
  Visual design below) from a `visual` prop of the matching type. This is the
  one deliberately non-uniform piece: the four illustrations change in
  different ways because the four places change in different ways.
- `src/components/PlaceVisual.astro` — props `{ place: Place; scope: string;
  stop: StopBase }`. Picks the matching visuals component by `place.id`,
  passes `stop.visual`, and renders the label/description underneath
  (`data-testid="place-visual" data-place-id data-scope data-trajectory`).
  Used 5 times per place across the page: once in its own section, once in
  the comparison grid.
- `src/components/PlaceSection.astro` — props `{ place: Place }`. Wraps the
  `mechanism`/`contrast` text, a `TimeSlider` scoped to that place's id, and a
  `PlaceVisual` scoped the same way. Instantiated 4 times in `index.astro`.
- Comparison markup lives directly in `index.astro`: a `<fieldset>` with a
  `<legend>Compare places</legend>` and 4 checkboxes
  (`data-testid="compare-toggle" data-place-id`), a `TimeSlider
  scope="compare"` plus a play/pause button
  (`data-testid="compare-play" aria-pressed="false"` by default — see
  main.ts), and `data-testid="compare-grid"` holding all 4 `PlaceVisual
  scope="compare"` instances in a compact layout (see Styling), pre-rendered
  and toggled via `hidden`, not created/destroyed at runtime.

Every `PlaceVisual` (individual or comparison) is pre-filled at build time
with stop-0 state via the same `getStateForPlace` function `main.ts` uses at
runtime — closes the "hooks exist" vs "hooks are actually wired to data" gap.

## Visual design: each place changes along its own dimensions

Your correction here was specific: TIME is the one shared variable, not a
universal "how much has this changed" score, and the four illustrations
should visibly change in different ways rather than all being one silhouette
with a single fading overlay. So each place's SVG renders its *own* fields
from its `visual` object:

- **NYC subway**: a subway-entrance/skyline base. Three independent layers:
  a rising water shape (height = `waterLevel`), vegetation dots at entrances
  (opacity/count = `vegetation`), and a rust/crack tint (opacity =
  `structuralDamage`). Because `waterLevel` moves fastest and earliest, the
  water rising is the dominant visible change in the first few stops — which
  matches the mechanism text (this is a flooding story first).
- **Great Wall**: a crenellated wall-profile base. Vegetation patches
  (opacity/count = `vegetation`), an eroded/jagged silhouette edge (deformed
  by `erosion`), and a small number of gap shapes that reveal as
  `missingSections` crosses thresholds (0 gaps until ~stop 4, then one gap
  shape per subsequent stop). Early stops (1, 2, 3) render pixel-identical —
  the point made directly, not just stated: this structure doesn't respond on
  human timescales.
- **Nuclear plant**: a containment dome (its own outline, only very lightly
  tinted by `containmentWeathering`, which stays low across the whole
  timeline) plus a separate cooling-tower/building group weathered by
  `peripheralWeathering`. `systemStatus` additionally drives a small discrete
  status badge (icon + color: green "operating" → yellow "auto-shutdown" →
  orange "backup-power" → red "cooling-lost" → grey
  "long-term-containment") — a state change, not a continuous fade, which is
  the right shape for something that fails in stages. The dome staying crisp
  while the periphery visibly weathers *is* the compound story, shown, not
  just described.
- **Rainforest**: a canopy/tree-line base with two low-ceiling, low-opacity
  layers: a second, slightly different canopy silhouette (`canopyChange`) and
  a small animal silhouette (`wildlifeVisibility`). Both stay visually subtle
  even at stop 6 — scrubbing the entire timeline produces the smallest change
  of any of the four illustrations, which is the argument.
- Labels/descriptions sit below each illustration as a short caption, never
  the primary carrier.
- `data-trajectory` (`decline` / `compound` / `independent`) still tints a
  border/caption accent as a consistent secondary signal across sections,
  even though the illustrations' own content differs.
- Numbers are never rendered as literal text in the UI — only used to drive
  layer geometry/opacity/thresholds, so nothing implies false precision.

## `src/scripts/main.ts`

```ts
function bindTimeSlider(scope: string, onChange: (stopIndex: number) => void): HTMLInputElement | null {
  const slider = document.querySelector<HTMLInputElement>(`[data-testid="time-slider"][data-scope="${scope}"]`);
  const readout = document.querySelector<HTMLElement>(`[data-testid="time-readout"][data-scope="${scope}"]`);
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
```

- **Individual sections** (×4): `bindTimeSlider(place.id, (i) =>
  renderVisual(place, place.id, i))`, where `renderVisual` looks up
  `getStateForPlace(place, i)` and updates only that place's own
  `PlaceVisual`: passes the new `visual` object into that place's SVG-update
  function (each place's visuals component exposes its own small updater,
  e.g. `updateNycVisual(el, visual)`, since the fields differ per place),
  plus the label/description text.
- **Comparison section**: `bindTimeSlider("compare", (i) => { for (const p of
  PLACES) renderVisual(p, "compare", i); })` — updates all 4 comparison
  visuals together regardless of checkbox state; checkboxes only toggle
  `hidden` on each `PlaceVisual`, decoupling "what's shown" from "what time
  it's at" so toggling a checkbox never resets or recomputes the current time.
- **Autoplay — off by default, user-triggered only, stops at the end.**
  `compare-play` starts paused (`aria-pressed="false"`); nothing runs on page
  load. Clicking it starts a `setInterval` stepping the compare slider's value
  by 1 every ~1200ms, and flips `aria-pressed="true"`; reaching the final stop
  (500 years) stops the interval and resets the button to `aria-pressed="false"`
  — it does not loop back to day 1, since "play" here means "watch this one
  timeline through to its end state," not a looping animation. Clicking the
  button again mid-playback (or manually dragging the compare slider) also
  pauses it, at whatever stop it's currently on. The manual slider remains the
  primary way to inspect any moment — play is presented as an optional way to
  *watch* the same progression once, not a required control. No speed
  selector, no scrub-while-playing affordance.
- **Fallback if time is short**: autoplay is the one piece of this plan safe
  to cut without losing the argument — the checkbox filter plus manual
  scrubbing on the shared slider already lets a visitor put any subset of
  places at the same moment in time, which is the actual claim being made.

## Tests

Data-contract (`spec/assignment-1.test.ts`, no build needed) — verifying the
actual explanatory contract, not forcing a conclusion:
- every place has exactly `TIMELINE.length` stops
- every place has non-empty `mechanism` and `contrast`
- every stop has a non-empty `label`, `description`, and a `visual` object
  with the fields specific to that place's type (e.g. NYC stops all have
  `waterLevel`/`vegetation`/`structuralDamage` as numbers)
- every stop has `evidence` set to `"observed"` or `"inferred"`, and every id
  in every stop's `sourceIds` exists as a key in `SOURCES` — a claim can never
  cite a source that isn't there
- `new Set(PLACES.map(p => p.trajectory)).size > 1` — the dataset actually
  contains more than one kind of response, not just degrees of one
- `getStateForPlace(place, 0)` and `getStateForPlace(place, TIMELINE.length - 1)`
  return different `label` values for every place — every place's story
  visibly moves somewhere across the full timeline, without asserting *how
  much* or forcing any specific place to be "most" or "least" affected

Removed from the earlier draft, deliberately: a generic non-decreasing
"transformation" check and a rule that the rainforest's numeric peak must be
lower than every other place's. Both forced the intended conclusion into the
test rather than checking the actual contract — with `transformation` gone in
favor of place-specific visual fields, there's no single number left to make
that claim about anyway, and the qualitative reasoning it protected now lives
in the content and the explanatory text where it belongs.

DOM/build-output (jsdom against `dist/index.html`):
- 5 `[data-testid="time-slider"]` elements exist, one per `data-scope` in
  `["nyc","wall","nuclear","rainforest","compare"]`, each `type="range"` with
  `min="0"` / `max` equal to `TIMELINE.length - 1`
- each individual section's default `PlaceVisual` label/description text
  matches `getStateForPlace(place, 0)` (whitespace-normalized) — verifies
  build-time render is actually wired to the data
- 4 `[data-testid="compare-toggle"]` checkboxes exist, one per place id
- the comparison grid contains exactly `PLACES.length` `PlaceVisual` instances
  scoped `data-scope="compare"`
- `[data-testid="compare-play"]` renders with `aria-pressed="false"` in the
  built markup — the static contract that autoplay starts paused, not just a
  runtime behavior to trust

`src/lib/interaction.test.ts` (co-located, pure logic, no DOM):
- `getStateForPlace` clamps out-of-range indices for every place, same
  edge-case coverage as originally planned
- for each place, calling `getStateForPlace` at every stop index and reading
  back its own place-specific visual fields round-trips correctly (guards
  against a copy-paste mixing up which visual shape belongs to which place)

Not mechanically tested, left to manual verification (see below): whether
individual sliders visibly affect only their own section, whether the compare
slider visibly moves all checked places together, and autoplay's timing/feel
— these need a real browser and a person, same as viewport behavour already
does in this repo's spec.

## Styling

- Each `PlaceSection` is a normal block-level section with its own heading.
- **Comparison grid, responsive**: `.compare-grid { display: grid;
  grid-template-columns: repeat(2, 1fr); gap: ...; }` as the base (mobile-first)
  rule, so at 390px up to 4 selected places sit in a compact 2×2 grid. At a
  wider breakpoint (desktop, e.g. `@media (min-width: 60rem)`) it switches to
  `grid-template-columns: repeat(4, 1fr)` so up to 4 selected places can sit
  in a single row side by side. Unchecked places use the native `hidden`
  attribute, which is `display: none` by default — CSS grid auto-placement
  skips `display: none` items entirely and packs the remaining ones into
  consecutive cells, so 1, 2, 3, or 4 selected places always reflow to fill
  the available cells with no blank slot where an unchecked place would have
  been (correcting the earlier draft's assumption that `hidden` would leave a
  gap — it doesn't, for grid items). Comparison cards stay deliberately more
  compact than the individual sections' visuals at every width: smaller
  illustration viewBox, label only (no repeated mechanism/contrast prose,
  since that's already been read above).
- `global.css`'s current `main { max-width: 40rem }` stays for the individual
  sections (prose width is appropriate there); the compare section gets its
  own scoped width override so the 2-column grid isn't squeezed.
- Checkbox group: real `<input type="checkbox">` + `<label>` pairs inside a
  `<fieldset>/<legend>`, not custom-styled divs — free keyboard and
  screen-reader support.

## Scope guardrails

- Time is the only mechanic. The checkbox filter selects what's visible, not
  a second way of interacting with the data.
- Autoplay is off by default and the first thing to cut if time runs short.
- No other controls: no per-place "learn more," no URL-encoded state, no
  reset button, no speed selector.
- Keep each section's explanatory text to 2-4 sentences (`mechanism` +
  `contrast`) — the illustration should still be doing most of the
  explaining.

## Verification

1. `pnpm check` green.
2. `pnpm dev` under the base path — scrub each of the 4 individual sliders
   independently and confirm only that section's own illustration changes,
   and that each place's illustration changes in its *own* way (water rising
   for NYC, vegetation/erosion/gaps for the wall, a status badge plus
   peripheral-only weathering for the nuclear plant, subtle canopy/wildlife
   shifts for the rainforest) — not a uniform fade.
3. Scrub the compare slider and confirm all *checked* places update together
   at the same stop; toggle checkboxes mid-timeline and confirm visibility
   changes without resetting the current time.
4. Confirm the compare-play button starts paused with no motion on page load;
   that pressing it starts a visible progression; that it stops on its own at
   the 500-year stop (not looping back to day 1); and that a second press (or
   dragging the slider) pauses it mid-way at whatever stop it's on.
5. Tab through the whole page: 5 sliders (native range = arrow-key operable),
   4 checkboxes, 1 play button — confirm nothing is a keyboard trap and focus
   order matches visual order.
6. Check layout at both graded viewports, 1920×1080 and 390×844 — in
   particular confirm the comparison grid stays 2 columns and legible at
   390px with up to 4 cards checked.
