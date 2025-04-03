export enum Decision {
  StrongNo = "strong_no",
  No = "no",
  Maybe = "maybe",
  Yes = "yes",
  StrongYes = "strong_yes",
}

export enum Status {
  applied = "applied",
  review = "review",
  interview1 = "interview1",
  interview2 = "interview2",
  ha = "ha",
  offer = "offer",
  hired = "hired",
  rejected = "rejected",
}

export interface Grade {
  name: string;
  description: string;
  scale: string;
}

export interface JobDescription {
  id: string;
  name: string;
  description: string;
  grades: Grade[];
}
export interface Eval {
  name: string;
  reason: string;
  value: string;
}

export interface CV {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  summary: string;
  gradesEval: Eval[];
  fileName: string;
}

export interface HA {
  id: string;
  name: string;
  repo: string;
  description: string;
  status: "completed" | "in_progress" | "not_started";
  grades: Grade[];
  gradesEval: Eval[];
}

export interface Candidate {
  id: string;
  name: string;
  surname: string;
  cv: CV;
  ha: HA;
  decision: Decision;
  status: Status;
  lastUpdated: number; // Timestamp
  createdAt: number; // Timestamp
}

export interface SummaryResult {
  id: string;
  timestamp: number;
  originalFilename: string;
  yearsOfExperience: string;
  skillsAndFrameworks: string;
  languages: string;
  education: string;
  summary: string;
}
