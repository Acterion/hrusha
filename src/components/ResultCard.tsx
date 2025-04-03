import { SummaryResult } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Ensure Shadcn Card is imported

interface ResultCardProps {
  result: SummaryResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const formattedDate = new Date(result.timestamp).toLocaleString();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>Generated on: {formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium">Original File:</p>
        <p className="text-sm text-muted-foreground mb-3">
          {result.originalFilename}
        </p>
        <p className="text-sm font-medium"> Years of Experience</p>
        <p>{result.yearsOfExperience}</p>
        <p className="text-sm font-medium"> Skills and Frameworks</p>
        <p>{result.skillsAndFrameworks}</p>
        <p className="text-sm font-medium"> Languages </p>
        <p>{result.languages}</p>
        <></>
        <></>
        <p className="text-sm font-medium">Summary:</p>
        <p>{result.summary}</p>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">ID: {result.id}</p>
      </CardFooter>
    </Card>
  );
}
