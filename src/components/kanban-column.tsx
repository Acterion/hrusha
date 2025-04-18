import { useDroppable } from "@dnd-kit/core";
import type { Candidate } from "@/types";
import { CandidateCard } from "@/app/components/candidate-card";

interface KanbanColumnProps {
  id: string;
  title: string;
  candidates: Candidate[];
  count: number;
}

export function KanbanColumn({
  id,
  title,
  candidates,
  count,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] max-w-[280px] h-[calc(100vh-150px)] bg-muted/30 rounded-md ${
        isOver ? "ring-2 ring-primary ring-inset" : ""
      }`}
    >
      <div className="p-3 border-b bg-muted/50 rounded-t-md">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <span className="text-sm text-muted-foreground bg-background px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
      </div>

      <div className="flex-1 p-2 overflow-y-auto">
        {candidates.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}

        {candidates.length === 0 && (
          <div className="flex items-center justify-center h-20 border border-dashed rounded-md text-sm text-muted-foreground">
            No candidates
          </div>
        )}
      </div>
    </div>
  );
}
