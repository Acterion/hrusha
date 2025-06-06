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
import { useState, useRef } from "react";

interface KanbanBoardProps {
  candidates: Candidate[];
  onCandidateMove: (candidateId: string, newStatus: Status) => void;
  onCandidateClick?: (candidateId: string) => void;
}

export function KanbanBoard({
  candidates,
  onCandidateMove,
  onCandidateClick,
}: KanbanBoardProps) {
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(
    null
  );
  const statuses = Object.values(Status);
  const dragStartTimeRef = useRef<number | null>(null);
  const draggedCandidateIdRef = useRef<string | null>(null);

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

  // Setup sensors for drag and drop with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Add activation constraints to distinguish between clicks and drags
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    dragStartTimeRef.current = Date.now();
    draggedCandidateIdRef.current = active.id.toString();

    const activeCandidate = candidates.find((c) => c.id === active.id);
    if (activeCandidate) {
      setActiveCandidate(activeCandidate);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const dragDuration = Date.now() - (dragStartTimeRef.current || 0);

    // If the drag was very short, consider it a click
    if (
      dragDuration < 200 &&
      onCandidateClick &&
      draggedCandidateIdRef.current
    ) {
      onCandidateClick(draggedCandidateIdRef.current);
    } else if (over) {
      // Check if the over.id is a status (column)
      const isColumn = statuses.includes(over.id.toString() as Status);

      if (isColumn && active.id !== over.id) {
        const candidateId = active.id.toString();
        const newStatus = over.id.toString() as Status;
        onCandidateMove(candidateId, newStatus);
      }
    }

    setActiveCandidate(null);
    draggedCandidateIdRef.current = null;
    dragStartTimeRef.current = null;
  };

  return (
    <DndContext
      sensors={sensors}
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
              onCandidateClick={onCandidateClick}
            />
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeCandidate ? (
          <CandidateCard
            candidate={activeCandidate}
            onClick={() => {}} // Disabled during drag
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
