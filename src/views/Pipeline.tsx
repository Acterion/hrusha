import { useState, useEffect } from "react";
import type { Candidate, Status } from "@/types";
import { KanbanBoard } from "@/app/components/kanban-board";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { toast } from "@/app/components/ui/sonner";
import { generateFakeCandidates } from "@/app/utils/mock-data";

// Generate fake candidates using our utility function
const mockCandidates = generateFakeCandidates(8);

export default function Pipeline() {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [filterText, setFilterText] = useState("");
  const [filterDecision, setFilterDecision] = useState<string>("all");
  const [filteredCandidates, setFilteredCandidates] =
    useState<Candidate[]>(candidates);

  // Apply filters when candidates, filterText, or filterDecision changes
  useEffect(() => {
    let filtered = [...candidates];

    if (filterText) {
      const searchTerm = filterText.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchTerm) ||
          candidate.surname.toLowerCase().includes(searchTerm) ||
          candidate.cv.summary.toLowerCase().includes(searchTerm)
      );
    }

    if (filterDecision && filterDecision !== "all") {
      filtered = filtered.filter(
        (candidate) => candidate.decision === filterDecision
      );
    }

    setFilteredCandidates(filtered);
  }, [candidates, filterText, filterDecision]);

  // Handle moving a candidate to a new status
  const handleCandidateMove = (candidateId: string, newStatus: Status) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === candidateId
          ? {
              ...candidate,
              status: newStatus,
              lastUpdated: Date.now(),
            }
          : candidate
      )
    );

    toast.success("Candidate status updated", {
      description: `Candidate moved to ${newStatus
        .replace(/([A-Z])/g, " $1")
        .trim()}`,
    });
  };

  return (
    <div className="flex flex-col gap-4 max-w-full">
      <div className="w-full max-w-6/12 mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <Label htmlFor="search" className="mb-2 block">
              Search Candidates
            </Label>
            <Input
              id="search"
              placeholder="Search by name or summary..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>

          <div className="w-full md:w-64">
            <Label htmlFor="decision-filter" className="mb-2 block">
              Filter by Decision
            </Label>
            <Select value={filterDecision} onValueChange={setFilterDecision}>
              <SelectTrigger id="decision-filter">
                <SelectValue placeholder="All decisions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All decisions</SelectItem>
                <SelectItem value="strong_yes">Strong Yes</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="maybe">Maybe</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="strong_no">Strong No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setFilterText("");
              setFilterDecision("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="max-w-11/12 overflow-x-auto pb-4 border rounded-md">
        <div className="min-w-max p-4">
          <KanbanBoard
            candidates={filteredCandidates}
            onCandidateMove={handleCandidateMove}
          />
        </div>
      </div>
    </div>
  );
}
