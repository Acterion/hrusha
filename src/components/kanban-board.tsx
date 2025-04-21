import { CandidateCard } from "@/app/components/candidate-card";
import { KanbanColumn } from "@/app/components/kanban-column";
import { Candidate, Status } from "@/types";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";

interface KanbanBoardProps {
  candidates: Candidate[];
  onCandidateMove: (candidateId: string, newStatus: Status) => void;
}

export function KanbanBoard({ candidates, onCandidateMove }: KanbanBoardProps) {
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(
    null
  );
  const statuses = Object.values(Status);

  // Group candidates by status
  const candidatesByStatus = statuses.reduce((acc, status) => {
    acc[status] = candidates.filter((candidate) => candidate.status === status);
    return acc;
  }, {} as Record<Status, Candidate[]>);

  // Status display names
  const statusDisplayNames: Record<Status, string> = {
    applied: "Applied",
    review: "Review",
    interview1: "First Interview",
    interview2: "Second Interview",
    ha: "Home Assignment",
    offer: "Offer",
    hired: "Hired",
    rejected: "Rejected",
  };

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    console.log("start", event);
    const { active } = event;
    const activeCandidate = candidates.find((c) => c.id === active.id);
    if (activeCandidate) {
      setActiveCandidate(activeCandidate);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      // Check if the over.id is a status (column)
      const isColumn = statuses.includes(over.id.toString() as Status);

      if (isColumn && active.id !== over.id) {
        const candidateId = active.id.toString();
        const newStatus = over.id.toString() as Status;
        onCandidateMove(candidateId, newStatus);
      }
    }

    setActiveCandidate(null);
  };

  return (
    <DndContext
      sensors={sensors}
      //   collisionDetection={rectangleIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4">
        {statuses.map((status) => (
          <SortableContext
            key={status}
            items={candidatesByStatus[status].map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn
              id={status}
              title={statusDisplayNames[status]}
              candidates={candidatesByStatus[status]}
              count={candidatesByStatus[status].length}
            />
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeCandidate ? <CandidateCard candidate={activeCandidate} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
