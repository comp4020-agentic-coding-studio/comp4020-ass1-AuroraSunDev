export interface Source {
  title: string;
  url: string;
}

// Real sources checked while writing src/data/places.ts. Referenced by id
// from each stop's sourceIds; spec/assignment-1.test.ts verifies every id
// used there actually exists here, so a claim can never cite a source that
// isn't in this map.
export const SOURCES: Record<string, Source> = {
  "mta-daily-pumping": {
    title: "NYU Wagner — Building Flood Resilience into the NYC Subway",
    url: "https://wagner.nyu.edu/rudincenter/2022/09/building-flood-resilience-nyc-subway",
  },
  "sandy-flooding": {
    title: "CBS New York — pumping flooded tunnels could take days",
    url: "https://www.cbsnews.com/newyork/news/mta-salt-water-in-subways-could-mean-long-major-repairs/",
  },
  "great-wall-loss": {
    title: "TIME — China's Great Wall Is Crumbling Away",
    url: "https://time.com/3941018/china-great-wall-decay-crumbling-missing/",
  },
  "great-wall-gansu-erosion": {
    title: "NBC News — Sandstorms eating away at China's Great Wall",
    url: "https://www.nbcnews.com/id/wbna20492488",
  },
  "nrc-scram": {
    title: "NRC — Backgrounder on the Three Mile Island Accident",
    url: "https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/3mile-isle",
  },
  "unmanned-reactor-estimate": {
    title:
      "ScienceABC — How Long Can Nuclear Reactors Run Without Human Interference?",
    url: "https://www.scienceabc.com/eyeopeners/how-long-can-nuclear-reactors-run-without-human-interference.html",
  },
  "containment-design-life": {
    title: "ORNL — Nuclear Power Plant Concrete Structures",
    url: "https://www.ornl.gov/publication/nuclear-power-plant-concrete-structures",
  },
  "forest-succession-recovery": {
    title:
      "PMC — Incomplete recovery of tree community composition after 120 years of tropical forest succession in Panama",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10952663/",
  },
  "tree-longevity": {
    title:
      "PNAS — Global tree-ring analysis reveals rapid decrease in tropical tree longevity with temperature",
    url: "https://www.pnas.org/doi/10.1073/pnas.2003873117",
  },
  "great-wall-biocrust": {
    title: "Science Advances — Biocrusts protect the Great Wall of China from erosion",
    url: "https://www.science.org/doi/10.1126/sciadv.adk5892",
  },
  "chernobyl-wildlife-census": {
    title:
      "Current Biology — Long-term census data reveal abundant wildlife populations at Chernobyl",
    url: "https://www.cell.com/current-biology/fulltext/S0960-9822(15)00988-4",
  },
};
