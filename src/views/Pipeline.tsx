import { useState, useEffect } from "react";
import { schemas, type Candidate, type Status } from "@/types";
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
import { Skeleton } from "../components/ui/skeleton";

// Generate fake candidates using our utility function
const mockCandidates = generateFakeCandidates(8);

export default function Pipeline() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [filterText, setFilterText] = useState("");
  const [filterDecision, setFilterDecision] = useState<string>("all");
  const [filteredCandidates, setFilteredCandidates] =
    useState<Candidate[]>(candidates);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/candidates");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();

        // Validate with Zod
        data = data.map((item: any) => ({
          ...item,
          cv: JSON.parse(item.cv),
          ha: JSON.parse(item.ha),
        }));
        const parseResult = schemas.Candidate.array().safeParse(data);
        if (!parseResult.success) {
          throw new Error(`Invalid data format: ${parseResult.error.message}`);
        }

        setCandidates(parseResult.data);
      } catch (e: any) {
        console.error("Failed to fetch candidates:", e);
        setError(`Failed to load candidates: ${e.message}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
  const handleCandidateMove = async (
    candidateId: string,
    newStatus: Status
  ) => {
    // Optimistically update the UI
    const originalCandidates = candidates;
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

    try {
      // Make the API call to update the backend
      const response = await fetch(`/api/candidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, candidateId }), // Only send necessary data
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update candidate status: ${response.statusText}`
        );
      }

      toast.success("Candidate status updated", {
        description: `Candidate moved to ${newStatus
          .replace(/([A-Z])/g, " $1")
          .trim()}`,
      });
    } catch (error) {
      console.error("Error updating candidate status:", error);
      // Rollback the optimistic update
      setCandidates(originalCandidates);
      toast.error("Error updating candidate status", {
        description: "Failed to update candidate status. Please try again.",
      });
    }
  }; // <-- Add closing brace for handleCandidateMove here

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full mb-4">
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
      <div className="overflow-auto p-4 border rounded-md">
        {loading && (
          <Skeleton className="text-center text-blue-500">
            Loading candidates...
          </Skeleton>
        )}
        {error && (
          <p className="text-center text-red-500 bg-red-100 p-3 rounded">
            {error}
          </p>
        )}
        {!loading && !error && (
          <KanbanBoard
            candidates={filteredCandidates}
            onCandidateMove={handleCandidateMove}
          />
        )}
      </div>
    </div>
  );
}
