export type Trajectory = "decline" | "compound" | "independent";
export type DependencyLevel = "high" | "medium" | "low";

// Describes THIS STOP'S CLAIM about this human-vanish scenario, not the
// underlying source. "observed" is reserved for states that are true of the
// real place right now, independent of the human-vanish premise (e.g. "no
// visible change" is trivially true today too; a currently-unmaintained wall
// segment's condition is a real, present fact). Every future-projected or
// scenario-specific claim is "inferred", even when it leans on a strong
// real-world precedent — a documented historical fact does not make a
// hypothetical future state itself observed.
export interface Evidence {
  evidence: "observed" | "inferred";
  sourceIds: string[]; // keys into SOURCES; [] if the reasoning has no single citable source
  qualification?: string; // states the reasoning gap explicitly
}

interface StopBase extends Evidence {
  label: string;
  description: string;
}

export interface NycVisual {
  waterLevel: number; // 0-100
  vegetation: number; // 0-100
  structuralDamage: number; // 0-100
}

export interface WallVisual {
  vegetation: number; // 0-100
  erosion: number; // 0-100
  missingSections: number; // 0-100
}

export type ReactorStatus =
  | "operating"
  | "auto-shutdown"
  | "backup-power"
  | "cooling-lost"
  | "long-term-containment";

export interface NuclearVisual {
  systemStatus: ReactorStatus;
  peripheralWeathering: number; // 0-100
  containmentWeathering: number; // 0-100, kept low throughout
}

export interface RainforestVisual {
  canopyChange: number; // 0-100, low ceiling
  wildlifeVisibility: number; // 0-100, low ceiling
}

interface PlaceOf<Id extends string, V> {
  id: Id;
  name: string;
  dependency: DependencyLevel;
  trajectory: Trajectory;
  mechanism: string; // why THIS place depends on humans this way
  contrast: string; // how its trajectory differs from the others
  stops: (StopBase & { visual: V })[]; // same length/order as TIMELINE
}

export type NycPlace = PlaceOf<"nyc", NycVisual>;
export type WallPlace = PlaceOf<"wall", WallVisual>;
export type NuclearPlace = PlaceOf<"nuclear", NuclearVisual>;
export type RainforestPlace = PlaceOf<"rainforest", RainforestVisual>;

export type Place = NycPlace | WallPlace | NuclearPlace | RainforestPlace;

const nyc: NycPlace = {
  id: "nyc",
  name: "New York City subway",
  dependency: "high",
  trajectory: "decline",
  mechanism:
    "The city's tunnels sit below the water table; keeping them dry, powered, and signaled takes continuous, active work.",
  contrast:
    "Nothing else here changes this fast — most of the transformation happens within the first year, not over centuries.",
  stops: [
    {
      label: "Pumps silent",
      description:
        "Even on an ordinary dry day the system pumps roughly 10-13 million gallons of groundwater out daily; that stops immediately, and water starts rising the same day.",
      evidence: "inferred",
      sourceIds: ["mta-daily-pumping"],
      qualification:
        "extrapolated from today's continuous pumping requirement — no real case of NYC's pumps actually stopping.",
      visual: { waterLevel: 5, vegetation: 0, structuralDamage: 2 },
    },
    {
      label: "Low sections filling",
      description:
        "At that same seepage rate, the lowest-lying tunnels are accumulating serious standing water within days.",
      evidence: "inferred",
      sourceIds: ["mta-daily-pumping", "sandy-flooding"],
      visual: { waterLevel: 25, vegetation: 0, structuralDamage: 5 },
    },
    {
      label: "Substantially flooded",
      description:
        "Most below-water-table sections are underwater; drier upper sections start showing rust and early plant growth.",
      evidence: "inferred",
      sourceIds: ["mta-daily-pumping", "sandy-flooding"],
      qualification:
        "real storm-flood events show partial flooding when pumps are overwhelmed; full, permanent pump loss is inferred to be worse, not itself observed.",
      visual: { waterLevel: 55, vegetation: 3, structuralDamage: 15 },
    },
    {
      label: "Systems corroding",
      description:
        "Standing water and open air are destroying rails, third-rail power, and signaling electronics.",
      evidence: "inferred",
      sourceIds: ["mta-daily-pumping"],
      visual: { waterLevel: 75, vegetation: 10, structuralDamage: 40 },
    },
    {
      label: "Structurally failing",
      description:
        "Freeze-thaw and water pressure are collapsing weaker sections.",
      evidence: "inferred",
      sourceIds: [],
      qualification:
        "reasoned by analogy with other abandoned flooded infrastructure; no specific cited case.",
      visual: { waterLevel: 85, vegetation: 25, structuralDamage: 65 },
    },
    {
      label: "Mostly collapsed",
      description:
        "Flood-prone tunnels are largely collapsed voids; drier sections retain more structure.",
      evidence: "inferred",
      sourceIds: [],
      visual: { waterLevel: 90, vegetation: 40, structuralDamage: 85 },
    },
    {
      label: "Barely legible",
      description:
        "Little of the flood-exposed network survives as open tunnel.",
      evidence: "inferred",
      sourceIds: [],
      qualification:
        "beyond any direct evidence; reasoned from general material-degradation timescales, not a documented case.",
      visual: { waterLevel: 92, vegetation: 55, structuralDamage: 95 },
    },
  ],
};

const wall: WallPlace = {
  id: "wall",
  name: "The Great Wall of China",
  dependency: "low",
  trajectory: "decline",
  mechanism:
    "Built to endure with little upkeep — but not none: real unmaintained sections are crumbling right now, not hypothetically.",
  contrast:
    "The slowest of the four by far, and its later states aren't a guess — comparable unmaintained sections already exist today.",
  stops: [
    {
      label: "No visible change",
      description:
        "True today regardless of the premise — this structure doesn't change on a scale of days.",
      evidence: "observed",
      sourceIds: [],
      visual: { vegetation: 0, erosion: 0, missingSections: 0 },
    },
    {
      label: "No visible change",
      description: "Same as a day earlier.",
      evidence: "observed",
      sourceIds: [],
      visual: { vegetation: 0, erosion: 0, missingSections: 0 },
    },
    {
      label: "Quietly unvisited",
      description:
        "No structural change yet; without tourists or vendors, nearby paths go unused.",
      evidence: "observed",
      sourceIds: [],
      visual: { vegetation: 2, erosion: 1, missingSections: 0 },
    },
    {
      label: "Cracks take root",
      description: "Vegetation begins establishing in unmaintained mortar joints.",
      evidence: "inferred",
      sourceIds: ["great-wall-loss"],
      qualification:
        "extrapolated from typical reports of vegetation establishing in unmaintained mortar joints.",
      visual: { vegetation: 8, erosion: 3, missingSections: 0 },
    },
    {
      label: "Exposed sections erode fast",
      description:
        "Wind and weather strip weaker construction far faster than the stone core.",
      evidence: "inferred",
      sourceIds: ["great-wall-gansu-erosion"],
      qualification:
        "calibrated against a real reported case (~25 miles of exposed wall eroded to mounds of dirt within ~20 years in Gansu) but applied here by analogy, not as a direct observation of this wall segment.",
      visual: { vegetation: 20, erosion: 15, missingSections: 2 },
    },
    {
      label: "Uneven survival",
      description:
        "Weaker construction is failing much faster than well-built stone sections.",
      evidence: "inferred",
      sourceIds: ["great-wall-loss"],
      qualification:
        "calibrated against the present-day ~30% overall loss figure — itself the product of centuries of mixed, uneven maintenance history, used here only as an order-of-magnitude analogy.",
      visual: { vegetation: 35, erosion: 40, missingSections: 20 },
    },
    {
      label: "What already happens to old sections",
      description:
        "The closest real analogy: pre-Ming sections left unmaintained this long are reported as almost entirely disappeared.",
      evidence: "inferred",
      sourceIds: ["great-wall-loss"],
      qualification:
        "the real pre-Ming wall has been unmaintained for a comparably long span and is reported as 'almost entirely disappeared' — the closest available analogy, not a direct observation of this scenario.",
      visual: { vegetation: 45, erosion: 65, missingSections: 45 },
    },
  ],
};

const nuclear: NuclearPlace = {
  id: "nuclear",
  name: "Nuclear power plant",
  dependency: "high",
  trajectory: "compound",
  mechanism:
    "Its safety and cooling systems need continuous power and attention; its containment structure was engineered for a multi-decade service life largely independent of day-to-day upkeep.",
  contrast:
    "It changes almost as fast as the subway at first, but plateaus much lower — the one place here where fast collapse and long endurance happen at the same time, in different parts of the same site.",
  stops: [
    {
      label: "Automatic shutdown",
      description:
        "Reactors are designed to SCRAM (automatic emergency shutdown) on their own; the plant switches to backup diesel power.",
      evidence: "inferred",
      sourceIds: ["nrc-scram"],
      qualification:
        "SCRAM and the switch to backup power are real, regularly-tested reactor behavior — but applying that behavior to this specific human-disappearance scenario is still a projection onto a case that hasn't happened, not itself an observed outcome.",
      visual: { systemStatus: "auto-shutdown", peripheralWeathering: 2, containmentWeathering: 0 },
    },
    {
      label: "Backup power the bottleneck",
      description: "Diesel fuel and battery reserves are finite without anyone to resupply them.",
      evidence: "inferred",
      sourceIds: ["unmanned-reactor-estimate"],
      qualification:
        "a published estimate for a fully unattended plant, not a documented case of one actually left unattended this long.",
      visual: { systemStatus: "backup-power", peripheralWeathering: 5, containmentWeathering: 0 },
    },
    {
      label: "Cooling lost",
      description: "Without power, active cooling stops and fuel-handling systems go idle.",
      evidence: "inferred",
      sourceIds: ["unmanned-reactor-estimate", "nrc-scram"],
      qualification:
        "real station-blackout events show fuel damage can begin once cooling is lost this long, but outcomes are highly design-dependent.",
      visual: { systemStatus: "cooling-lost", peripheralWeathering: 15, containmentWeathering: 1 },
    },
    {
      label: "Containment endures",
      description:
        "Whatever happens to the fuel and cooling systems has typically played out within the first year; the structure remains standing regardless.",
      evidence: "inferred",
      sourceIds: [],
      visual: { systemStatus: "cooling-lost", peripheralWeathering: 30, containmentWeathering: 2 },
    },
    {
      label: "Two speeds, one site",
      description:
        "The buildings around it are visibly weathering while the containment structure itself shows almost nothing.",
      evidence: "inferred",
      sourceIds: ["containment-design-life"],
      qualification:
        "containment structures are licensed/engineered for roughly 40-60 years of service life — this stop is well within that, but the plant is no longer being licensed or inspected, so this is reasoned, not a design-life guarantee.",
      visual: { systemStatus: "long-term-containment", peripheralWeathering: 55, containmentWeathering: 4 },
    },
    {
      label: "Structure outlasts function",
      description:
        "The reactor's operating life is long over; its concrete shell is still doing the one job it has left.",
      evidence: "inferred",
      sourceIds: ["containment-design-life"],
      qualification:
        "well beyond any structure's documented design life (~40-60 years); reasoned from general concrete-durability engineering, not an industry claim about this timescale.",
      visual: { systemStatus: "long-term-containment", peripheralWeathering: 75, containmentWeathering: 8 },
    },
    {
      label: "A concrete monument",
      description:
        "Everything that needed people is long gone; what's left is mostly the shell built to not need them.",
      evidence: "inferred",
      sourceIds: ["containment-design-life"],
      qualification:
        "far beyond any real design-life figure or observed case; a general engineering extrapolation, held deliberately modest (containmentWeathering stays low) rather than asserting precise survival.",
      visual: { systemStatus: "long-term-containment", peripheralWeathering: 88, containmentWeathering: 15 },
    },
  ],
};

const rainforest: RainforestPlace = {
  id: "rainforest",
  name: "Tropical rainforest, undisturbed",
  dependency: "low",
  trajectory: "independent",
  mechanism:
    "This forest's current condition already reflects centuries of its own ecological cycles rather than active upkeep — it has very low direct dependence on continuous human maintenance, unlike a subway system or a power plant.",
  contrast:
    "Because its condition was never propped up by continuous maintenance in the first place, removing that maintenance doesn't trigger the kind of rapid change seen in built infrastructure — what change does happen here runs on the forest's own, much slower clock.",
  stops: [
    {
      label: "Unchanged",
      description: "Indistinguishable from any other day.",
      evidence: "observed",
      sourceIds: [],
      visual: { canopyChange: 0, wildlifeVisibility: 0 },
    },
    {
      label: "Unchanged",
      description: "The forest's normal cycles continue exactly as before.",
      evidence: "observed",
      sourceIds: [],
      visual: { canopyChange: 0, wildlifeVisibility: 1 },
    },
    {
      label: "Quieter, not different",
      description: "The only real difference is what's absent nearby, if anything ever was.",
      evidence: "observed",
      sourceIds: [],
      visual: { canopyChange: 1, wildlifeVisibility: 2 },
    },
    {
      label: "Slightly bolder wildlife",
      description:
        "Human-avoidant species may become somewhat more visible when human presence drops nearby.",
      evidence: "inferred",
      sourceIds: [],
      qualification:
        "some studies document human-avoidant species becoming more visible when human presence drops; effect size varies a lot by site and species, and this forest was already relatively undisturbed.",
      visual: { canopyChange: 2, wildlifeVisibility: 4 },
    },
    {
      label: "Its own clock",
      description:
        "Tropical forest turnover is generally estimated at under ~400 years, driven by storms, tree deaths, and succession that were already running before anyone was nearby.",
      evidence: "inferred",
      sourceIds: ["tree-longevity"],
      visual: { canopyChange: 4, wildlifeVisibility: 6 },
    },
    {
      label: "Turned over, not transformed",
      description:
        "Forest structure recovers to old-growth levels on a decades-to-a-century scale, well within the forest's own turnover rhythm.",
      evidence: "inferred",
      sourceIds: ["forest-succession-recovery"],
      qualification:
        "a long-term Panama study found forest structure recovers to old-growth levels by ~90 years after a disturbance, but full community composition can take much longer — used here as an order-of-magnitude reference, not a claim about this specific forest.",
      visual: { canopyChange: 8, wildlifeVisibility: 8 },
    },
    {
      label: "Governed by itself",
      description:
        "Canopy generations have turned over on the forest's own ecological terms, not because anyone left.",
      evidence: "inferred",
      sourceIds: ["tree-longevity", "forest-succession-recovery"],
      qualification:
        "within known tropical forest turnover timescales, but no study observes any one forest over a literal 500-year unvisited window — reasoned extrapolation.",
      visual: { canopyChange: 13, wildlifeVisibility: 10 },
    },
  ],
};

export const PLACES: readonly Place[] = [nyc, nuclear, wall, rainforest];
