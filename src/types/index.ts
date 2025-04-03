export interface SummaryResult {
  id: string;
  timestamp: number;
  originalFilename: string;
  yearsOfExperience: string;
  skillsAndFrameworks: string;
  languages: string;
  education: string;
  summary: string
}

export type SortField = "timestamp" | "summary"; // Add more if needed
export type SortOrder = "asc" | "desc";
