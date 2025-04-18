import { Candidate, CV, Eval, Grade, HA, JobDescription } from "@/types";

export function createCV(override: Partial<CV> = {}): CV {
  return {
    id: crypto.randomUUID(),
    name: "",
    surname: "",
    email: "",
    phone: "",
    summary: "",
    gradesEval: [],
    fileName: "",
    fileHash: "",
    fileStatus: "pending",
    ...override,
  };
}

export function createHA(override: Partial<HA> = {}): HA {
  return {
    id: crypto.randomUUID(),
    name: "Not assigned",
    repo: "",
    description: "",
    status: "not_started",
    grades: [],
    gradesEval: [],
    ...override,
  };
}

export function createEval(override: Partial<Eval> = {}): Eval {
  return {
    name: "",
    reason: "",
    value: "",
    ...override,
  };
}

export function createGrade(override: Partial<Grade> = {}): Grade {
  return {
    name: "",
    description: "",
    scale: "",
    ...override,
  };
}

export function createJobDescription(
  override: Partial<JobDescription> = {}
): JobDescription {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    grades: [],
    ...override,
  };
}

export function createCandidate(override: Partial<Candidate> = {}): Candidate {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name: "",
    surname: "",
    cv: createCV(),
    ha: createHA(),
    decision: "maybe",
    status: "applied",
    lastUpdated: now,
    createdAt: now,
    ...override,
  };
}

// Helper for creating a candidate from an uploaded CV
export function createCandidateFromCV(
  name: string,
  surname: string,
  email: string,
  fileName: string,
  fileHash: string = ""
): Candidate {
  return createCandidate({
    name,
    surname,
    cv: createCV({
      name,
      surname,
      email,
      fileName,
      fileHash,
    }),
  });
}
