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

// One stop = one of the ten moments in TIMELINE = one drawn frame. There is no
// numeric "visual" object any more: it existed to drive the generated SVGs, and
// once real artwork replaced those, keeping forty invented numbers alive would
// have been precision the site can't back.
export interface Stop extends Evidence {
  label: string;
  description: string;
}

export interface Place {
  id: string;
  name: string;
  dependency: DependencyLevel;
  trajectory: Trajectory;
  mechanism: string; // why THIS place depends on humans this way
  contrast: string; // how its trajectory differs from the others
  stops: Stop[]; // same length and order as TIMELINE
}

const nyc: Place = {
  id: "nyc",
  name: "New York City",
  dependency: "high",
  trajectory: "decline",
  mechanism:
    "A modern city is held up by work that never stops: power, pumping, repair. None of that fails because a part breaks. It fails because nobody is left to handle the exception — a protective relay trips, a generator drops off the network, and there is no operator to bring either back.",
  contrast:
    "It doesn't empty out evenly, either. Around 97% of the city's water arrives by gravity from reservoirs upstate, so taps on low floors outlive the grid, while the pumps that lift water to rooftop tanks do not: the city loses its height before it loses its ground. The fastest and most complete change of the four — and it doesn't end as a ruined city, it ends as a different kind of landscape.",
  stops: [
    {
      label: "The lights go out",
      description:
        "Cars lose their drivers and stop where they are, trains brake themselves, and by nightfall whole districts are dark with nobody left to hold the grid together.",
      evidence: "inferred",
      sourceIds: [],
      qualification:
        "how many hours the grid lasts can't be predicted; what is certain is the direction — faults occur and nobody restores anything.",
    },
    {
      label: "Underground starts filling",
      description:
        "The pumps that lift roughly 13 million gallons a day out of the subway need power, so the lowest tunnels begin to hold water.",
      evidence: "inferred",
      sourceIds: ["mta-daily-pumping", "sandy-flooding"],
      qualification:
        "extrapolated from today's continuous pumping requirement; no real case exists of the pumps stopping for good.",
    },
    {
      label: "A city on pause",
      description:
        "Screens, lifts and traffic lights are dead and the streets are silent, but from the air almost nothing has changed yet.",
      evidence: "inferred",
      sourceIds: [],
    },
    {
      label: "Nature finds the cracks",
      description:
        "One full winter opens the asphalt, blocked drains hold water, and the first plants take the street.",
      evidence: "inferred",
      sourceIds: [],
      qualification:
        "freeze-thaw damage to concrete and asphalt is well documented; applying it to an unmaintained city is reasoning, not a case study.",
    },
    {
      label: "Visibly abandoned",
      description:
        "Shrubs and young trees stand in the roadway, glass is failing across the facades, and the edge between park and city stops being obvious.",
      evidence: "inferred",
      sourceIds: [],
    },
    {
      label: "Streets become corridors",
      description:
        "Trees are tall enough to shade the avenues, and the cars are rusted frames still sitting in the positions where they stopped.",
      evidence: "inferred",
      sourceIds: [],
    },
    {
      label: "The forest closes over",
      description:
        "Canopy meets across most streets, smaller buildings are collapsing, and the subway is now a flooded cave system.",
      evidence: "inferred",
      sourceIds: [],
    },
    {
      label: "Towers without skin",
      description:
        "Curtain walls are largely gone and some bridges have lost spans, but the concrete cores still stand above the trees.",
      evidence: "inferred",
      sourceIds: [],
      qualification:
        "steel and reinforced concrete fail on different schedules, and no two structures here would go at once; this is the general direction, not a prediction about any one building.",
    },
    {
      label: "City becomes terrain",
      description:
        "Many towers are rubble mounds under forest and the waterfront has turned to marsh — from above, the street grid is what still gives it away.",
      evidence: "inferred",
      sourceIds: [],
    },
    {
      label: "An archaeological site",
      description:
        "The skyline is essentially gone: forest, wetland and a few enormous concrete remains. New York hasn't vanished, it has become a site.",
      evidence: "inferred",
      sourceIds: [],
      qualification:
        "beyond any direct evidence. What holds it up is that tunnels, foundations and made ground don't erase — they get buried and stay findable.",
    },
  ],
};

const nuclear: Place = {
  id: "nuclear",
  name: "Nuclear power plant",
  dependency: "high",
  trajectory: "compound",
  mechanism:
    "Two systems on one site with opposite needs. The cooling and safety equipment wants power and attention continuously. The containment shell was engineered to want almost nothing — metres of reinforced concrete, no thin skin, no glass, nothing for weather to get hold of. The same place runs on two clocks at once.",
  contrast:
    "Which means the danger and the ruin are unrelated. How bad it gets is settled early and mostly by the plant's own design, not by anything anyone could have done; the radioactivity that follows then falls on a schedule set by half-lives, which no absence changes. The only place here whose worst moment comes first and then recedes — after that the story stops being the accident and becomes weather and forest.",
  stops: [
    {
      label: "It shuts itself down",
      description:
        "Grid trouble triggers an automatic emergency shutdown and the backup diesels take over; from outside, nothing looks wrong at all.",
      evidence: "inferred",
      sourceIds: ["nrc-scram"],
      qualification:
        "automatic shutdown is real, regularly-tested reactor behaviour, but applying it to this scenario is still a projection onto a case that hasn't happened.",
    },
    {
      label: "The dangerous week",
      description:
        "Shutdown is not cooling: the fuel keeps making decay heat, and wherever diesel, batteries or pumps run out first, cooling is lost.",
      evidence: "inferred",
      sourceIds: ["unmanned-reactor-estimate"],
      qualification:
        "a published estimate for an unattended plant, not a record of one actually left alone this long.",
    },
    {
      label: "Already decided",
      description:
        "The violent phase is over: some plants held, others have damaged fuel and a building opened by a hydrogen explosion — not a nuclear one.",
      evidence: "inferred",
      sourceIds: ["unmanned-reactor-estimate", "nrc-scram"],
      qualification:
        "outcomes are strongly design-dependent; real station-blackout events show the mechanism but not a single common result.",
    },
    {
      label: "An industrial ruin",
      description:
        "Nothing is exploding any more. Grass comes up through the car park while parts of the buildings stay lethal to stand in.",
      evidence: "inferred",
      sourceIds: [],
    },
    {
      label: "Green against concrete",
      description:
        "Fences rust and saplings take the yard, but the reactor building is as conspicuous as it was on day one.",
      evidence: "inferred",
      sourceIds: ["containment-design-life"],
      qualification:
        "containment is engineered for roughly a 40-60 year service life; this stop sits well inside that, though nobody is inspecting it any more.",
    },
    {
      label: "More animals, not fewer",
      description:
        "Contaminated ground doesn't empty out. Long-term counts at Chernobyl found large mammals as common as in clean reserves nearby, and wolves far more so.",
      evidence: "inferred",
      sourceIds: ["chernobyl-wildlife-census"],
      qualification:
        "that census measures how many animals are present, not how healthy each one is, and a later re-analysis disputes it. Applied here by analogy.",
    },
    {
      label: "Forest takes the site",
      description:
        "Transmission towers are down and the offices have collapsed; the containment shell is cracking but still standing.",
      evidence: "inferred",
      sourceIds: ["containment-design-life"],
    },
    {
      label: "A fortress in a forest",
      description:
        "From the outside you would struggle to tell that an accident ever happened here.",
      evidence: "inferred",
      sourceIds: ["containment-design-life"],
      qualification:
        "well past any documented design life; reasoned from general concrete durability rather than an industry claim about this timescale.",
    },
    {
      label: "Industrial archaeology",
      description:
        "The medium-lived contamination has mostly decayed away. What remains is heavy concrete and a few very long-lived hot spots.",
      evidence: "inferred",
      sourceIds: [],
      qualification:
        "caesium and strontium decay on a scale of decades, but fuel-derived heavy elements do not — the site gets safer without becoming clean.",
    },
    {
      label: "An ancient ruin",
      description:
        "A half-collapsed cooling tower and huge concrete walls in mature forest. Anyone arriving without records would read it as some older civilisation's works.",
      evidence: "inferred",
      sourceIds: [],
    },
  ],
};

const wall: Place = {
  id: "wall",
  name: "The Great Wall of China",
  dependency: "low",
  trajectory: "decline",
  mechanism:
    "It isn't one building. The system runs past 20,000 km and was raised between the third century BC and the seventeenth, in fired brick and stone across the east and in packed earth through the dry west — two material families that come apart in different ways and on different clocks. And the famous restored stretches aren't standing on old workmanship alone: they are standing on inspection, drainage and repair.",
  contrast:
    "So its future isn't guesswork. Stretches nobody looks after are wearing down right now, and they are simply further along the road the maintained ones are on. By far the slowest of the four, and the only one whose later states you can go and look at today.",
  stops: [
    {
      label: "Only the visitors are gone",
      description:
        "Nothing about the structure has changed. The single difference is that from now on nobody will ever repair it.",
      evidence: "observed",
      sourceIds: [],
    },
    {
      label: "Identical to today",
      description: "A week is nothing to something that has stood for centuries.",
      evidence: "observed",
      sourceIds: [],
    },
    {
      label: "The drains start to clog",
      description: "Leaves and soil gather where they used to be swept away.",
      evidence: "observed",
      sourceIds: [],
    },
    {
      label: "One full winter",
      description:
        "Water, salt and freeze-thaw work at the joints; grass holds the brickwork and a few facing bricks come loose.",
      evidence: "inferred",
      sourceIds: ["great-wall-loss"],
      qualification:
        "extrapolated from reported decay of unmaintained sections, not measured on any specific stretch.",
    },
    {
      label: "The visitor centre goes first",
      description:
        "Ticket offices, railings and cable cars rot much faster than the wall does — and on the earthen sections, moss and bacterial crusts turn out to protect the surface rather than eat it.",
      evidence: "inferred",
      sourceIds: ["great-wall-biocrust"],
      qualification:
        "the protective effect of biocrusts was measured on today's drier rammed-earth sections; how far it holds elsewhere is unknown.",
    },
    {
      label: "The wild wall",
      description:
        "Battlements are missing in stretches, a watchtower has lost its top, and the rammed-earth core shows through where facing has fallen away.",
      evidence: "inferred",
      sourceIds: ["great-wall-gansu-erosion"],
      qualification:
        "calibrated against a real case — roughly 25 miles of exposed wall eroded to mounds within about 20 years in Gansu — applied here by analogy.",
    },
    {
      label: "No longer continuous",
      description:
        "You could not walk it any more. The line breaks into segments, and in summer the forest hides most of them.",
      evidence: "inferred",
      sourceIds: ["great-wall-loss"],
    },
    {
      label: "Merging with the ridge",
      description:
        "Long runs read as raised mounds and stone footings rather than as a wall.",
      evidence: "inferred",
      sourceIds: ["great-wall-loss"],
      qualification:
        "calibrated against the present-day figure of roughly a third already lost, itself the product of a long, uneven maintenance history.",
    },
    {
      label: "Landform, not architecture",
      description:
        "What stays legible is a suspiciously straight line running along the ridge under the trees.",
      evidence: "inferred",
      sourceIds: ["great-wall-loss"],
    },
    {
      label: "Still not gone",
      description:
        "Continuous wall has largely disappeared, but footings, scattered stone and buried earth remain — and some sections have already survived unmaintained for more than a thousand years.",
      evidence: "inferred",
      sourceIds: ["great-wall-loss"],
      qualification:
        "the pre-Ming wall is the closest real analogy: unmaintained for a comparable span and reported as almost entirely disappeared as a wall, while still being findable as a site.",
    },
  ],
};

const rainforest: Place = {
  id: "rainforest",
  name: "Tropical rainforest, undisturbed",
  dependency: "low",
  trajectory: "independent",
  mechanism:
    "There is nothing here to switch off. No grid, no pumps, no wires overhead, and deep inside it stretches where months can pass without anyone walking through. Its condition is the product of its own cycles — old trees falling, gaps opening, seedlings racing upward for the light — and not one of those was ever ours to keep going.",
  contrast:
    "So our absence isn't an event here, because our presence wasn't one. The only place whose first and last frames could be swapped without anyone noticing — with the honest caveat that \"undisturbed\" is a claim about direct upkeep, not about being untouched. What changes it across five hundred years is climate, which reaches everywhere, rather than our leaving.",
  stops: [
    {
      label: "Completely normal",
      description: "Nothing was being held up here, so nothing falls.",
      evidence: "observed",
      sourceIds: [],
    },
    {
      label: "Still nothing",
      description:
        "A big tree comes down and tears a hole in the canopy — exactly as it would have anyway.",
      evidence: "observed",
      sourceIds: [],
    },
    {
      label: "The change is at the edges",
      description:
        "Logging, burning and road-building stop. In the interior you would never know.",
      evidence: "observed",
      sourceIds: [],
    },
    {
      label: "Its own cycle",
      description:
        "Old trees die, gaps open, seedlings race upward, and the canopy closes again.",
      evidence: "inferred",
      sourceIds: ["tree-longevity"],
    },
    {
      label: "You could not tell",
      description:
        "From the air, five years without humans is indistinguishable from today.",
      evidence: "inferred",
      sourceIds: [],
    },
    {
      label: "Young forest on old scars",
      description:
        "The interior keeps its rhythm while cleared land outside it grows a convincing young forest.",
      evidence: "inferred",
      sourceIds: ["forest-succession-recovery"],
      qualification:
        "recovery rate depends heavily on how often the land burned and how close intact forest is; 20 years is enough for structure, not for everything.",
    },
    {
      label: "Fragments rejoin",
      description:
        "Roads and pasture close over, and the forest becomes more continuous than it is today.",
      evidence: "inferred",
      sourceIds: [],
    },
    {
      label: "Structure back, composition not",
      description:
        "Height and biomass return on abandoned land, but the mix of species does not simply come back.",
      evidence: "inferred",
      sourceIds: ["forest-succession-recovery"],
      qualification:
        "a long-term Panama study found structure recovering to old-growth levels in about 90 years while community composition lagged far behind.",
    },
    {
      label: "Traces hard to find",
      description:
        "Many tree generations later, the old clearings are difficult to pick out from above.",
      evidence: "inferred",
      sourceIds: [],
    },
    {
      label: "Still rainforest, different trees",
      description:
        "This frame and the first one may be impossible to tell apart — though the river has moved and not one of these trees is the same.",
      evidence: "inferred",
      sourceIds: ["tree-longevity", "forest-succession-recovery"],
      qualification:
        "no study watches one forest for 500 unvisited years. And greenhouse gases already emitted don't leave with us, so the drier southern and eastern margins are genuinely uncertain — that would be climate deciding, not our absence.",
    },
  ],
};

export const PLACES: readonly Place[] = [nyc, nuclear, wall, rainforest];
