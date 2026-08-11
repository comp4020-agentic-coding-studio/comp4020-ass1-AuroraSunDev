export interface TimeStop {
  id: string;
  label: string;
}

// The one variable every place and every slider (individual or shared) has
// in common. Everything else about how a place responds is its own.
export const TIMELINE: readonly TimeStop[] = [
  { id: "day-1", label: "1 day" },
  { id: "week-1", label: "1 week" },
  { id: "month-1", label: "1 month" },
  { id: "year-1", label: "1 year" },
  { id: "year-10", label: "10 years" },
  { id: "year-100", label: "100 years" },
  { id: "year-500", label: "500 years" },
];
