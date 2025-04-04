import { z } from "zod";
import {
  DecisionEnum,
  StatusEnum,
  GradeSchema,
  EvalSchema,
  JobDescriptionSchema,
  CVSchema,
  HASchema,
  CandidateSchema,
} from "./schemas";

// Export enums
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

// Export type interfaces inferred from the Zod schemas
export type Grade = z.infer<typeof GradeSchema>;
export type Eval = z.infer<typeof EvalSchema>;
export type JobDescription = z.infer<typeof JobDescriptionSchema>;
export type CV = z.infer<typeof CVSchema>;
export type HA = z.infer<typeof HASchema>;
export type Candidate = z.infer<typeof CandidateSchema>;

// Also export the schemas directly
export const schemas = {
  Decision: DecisionEnum,
  Status: StatusEnum,
  Grade: GradeSchema,
  Eval: EvalSchema,
  JobDescription: JobDescriptionSchema,
  CV: CVSchema,
  HA: HASchema,
  Candidate: CandidateSchema,
};
