export interface TimeStop {
  id: string;
  label: string;
  short: string; // tick-row form; ten full labels won't fit at phone width
}

// The one variable every place and every slider (individual or shared) has
// in common. Everything else about how a place responds is its own.
//
// These ten points are the ones every scene was drawn against, so a stop and
// a frame are the same moment. Earlier the site had seven, and the mismatch
// showed: mid-slider the caption read "1 year" over the year-20 drawing.
export const TIMELINE: readonly TimeStop[] = [
  { id: "day-1", label: "1 day", short: "1d" },
  { id: "week-1", label: "1 week", short: "1w" },
  { id: "month-1", label: "1 month", short: "1mo" },
  { id: "year-1", label: "1 year", short: "1y" },
  { id: "year-5", label: "5 years", short: "5y" },
  { id: "year-20", label: "20 years", short: "20y" },
  { id: "year-50", label: "50 years", short: "50y" },
  { id: "year-100", label: "100 years", short: "100y" },
  { id: "year-250", label: "250 years", short: "250y" },
  { id: "year-500", label: "500 years", short: "500y" },
];
