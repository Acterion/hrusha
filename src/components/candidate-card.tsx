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
  onClick?: (candidateId: string) => void;
}

export function CandidateCard({ candidate, onClick }: CandidateCardProps) {
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
      onClick={() => {
        if (onClick) {
          onClick(candidate.id);
        }
      }}
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
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">AI Suggestion</span>
            <Badge
              className={`${
                decisionColors[
                  candidate.decision as keyof typeof decisionColors
                ]
              } text-white`}
            >
              {formatDecision(candidate.decision)}
            </Badge>
          </div>
          <div className="flex flex-col items-center justify-between">
            <span className="text-sm text-muted-foreground">Decision</span>
            <Badge
              className={`${
                decisionColors[
                  candidate.decision as keyof typeof decisionColors
                ]
              } text-white`}
            >
              {formatDecision(candidate.decision)}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground justify-self-center col-span-2">
            {formatDate(candidate.lastUpdated)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
