import { z } from "zod";

export const DecisionEnum = z.enum([
  "strong_no",
  "no",
  "maybe",
  "yes",
  "strong_yes",
]);

export const StatusEnum = z.enum([
  "applied",
  "review",
  "interview1",
  "interview2",
  "ha",
  "offer",
  "hired",
  "rejected",
]);

export const GradeSchema = z.object({
  name: z.string(),
  description: z.string(),
  scale: z.string(),
});

export const EvalSchema = z.object({
  name: z.string(),
  reason: z.string(),
  value: z.string(),
});

export const JobDescriptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  grades: z.array(GradeSchema),
});

export const CVSchema = z.object({
  id: z.string(),
  name: z.string(),
  surname: z.string(),
  email: z.string().email(),
  phone: z.string(),
  summary: z.string(),
  gradesEval: z.array(EvalSchema),
  fileName: z.string(),
});

export const HASchema = z.object({
  id: z.string(),
  name: z.string(),
  repo: z.string(),
  description: z.string(),
  status: z.enum(["completed", "in_progress", "not_started"]),
  grades: z.array(GradeSchema),
  gradesEval: z.array(EvalSchema),
});

export const CandidateSchema = z.object({
  id: z.string(),
  name: z.string(),
  surname: z.string(),
  cv: CVSchema,
  ha: HASchema,
  decision: DecisionEnum,
  status: StatusEnum,
  lastUpdated: z.number(), // Timestamp
  createdAt: z.number(), // Timestamp
});
