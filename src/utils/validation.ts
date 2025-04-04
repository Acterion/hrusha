import { schemas } from "@types";

/**
 * Validate a candidate object using Zod schemas
 * Returns true if valid, logs errors and returns false if invalid
 */
export function validateCandidate(data: unknown): boolean {
  const result = schemas.Candidate.safeParse(data);
  if (!result.success) {
    console.error("Candidate validation failed:", result.error.format());
    return false;
  }
  return true;
}

/**
 * Format Zod validation errors into a human-readable string
 */
export function formatZodError(error: any): string {
  if (!error || !error.format) {
    return "Unknown validation error";
  }

  const formatted = error.format();
  return Object.entries(formatted)
    .filter(([key]) => key !== "_errors")
    .map(([key, value]: [string, any]) => {
      const errors = value._errors?.join(", ") || "";
      return `${key}: ${errors}`;
    })
    .join("\n");
}
