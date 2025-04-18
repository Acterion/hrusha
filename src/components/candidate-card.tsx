import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Candidate } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { formatDate } from "@/app/utils";

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: candidate.id,
      data: {
        candidate,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Decision color mapping
  const decisionColors = {
    strong_no: "bg-red-500 hover:bg-red-600",
    no: "bg-red-300 hover:bg-red-400",
    maybe: "bg-yellow-400 hover:bg-yellow-500",
    yes: "bg-green-400 hover:bg-green-500",
    strong_yes: "bg-green-600 hover:bg-green-700",
  };

  // Format decision for display
  const formatDecision = (decision: string) => {
    return decision.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-4 cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">
          {candidate.name} {candidate.surname}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Badge
              className={`${
                decisionColors[
                  candidate.decision as keyof typeof decisionColors
                ]
              } text-white`}
            >
              {formatDecision(candidate.decision)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(candidate.lastUpdated)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {candidate.cv.summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
