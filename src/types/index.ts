export interface SummaryResult {
  id: string;
  timestamp: number;
  originalFilename: string;
  originalText: string; // Maybe omit from frontend fetch if large?
  summary: string;
}

export type SortField = "timestamp" | "summary"; // Add more if needed
export type SortOrder = "asc" | "desc";
