import { Candidate } from "@types"; // Changed from @types/index
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
interface ResultCardProps {
  candidate: Candidate;
}

export function ResultCard({ candidate }: ResultCardProps) {
  const formattedDate = new Date(candidate.lastUpdated).toLocaleString();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>Generated on: {formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium">Original File:</p>
        <p className="text-sm text-muted-foreground mb-3">
          {candidate.cv.fileName}
        </p>
        <p className="text-sm font-medium">Summary:</p>
        <p>{candidate.cv.summary}</p>
        <p className="text-sm font-medium">Decision:</p>
        <p>{candidate.decision}</p>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">ID: {candidate.id}</p>
      </CardFooter>
    </Card>
  );
}
