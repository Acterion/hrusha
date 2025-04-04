import { Candidate, schemas } from "@types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatZodError } from "@/utils/validation";

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  // Optional validation with Zod (helpful for debugging)
  const validationResult = schemas.Candidate.safeParse(candidate);
  if (!validationResult.success) {
    console.warn(
      "Invalid candidate data:",
      formatZodError(validationResult.error)
    );
    // Could render fallback UI here if needed
  }

  const formattedDate = new Date(candidate.lastUpdated).toLocaleString();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>
          {candidate.name} {candidate.surname}
        </CardTitle>
        <CardDescription>Updated: {formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium">Original File:</p>
        <p className="text-sm text-muted-foreground mb-3">
          {candidate.cv.fileName}
        </p>
        <p className="text-sm font-medium">Summary:</p>
        <p className="mb-3">{candidate.cv.summary}</p>

        <p className="text-sm font-medium">Decision:</p>
        <p>{candidate.decision}</p>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">ID: {candidate.id}</p>
      </CardFooter>
    </Card>
  );
}
