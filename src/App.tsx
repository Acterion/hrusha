import { useState, useEffect, useMemo } from "react";
import { Candidate, schemas } from "@types";
import { CandidateCard } from "@/components/CandidateCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import "./App.css"; // Optional custom styles

function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from the public directory
        const response = await fetch("/candidates.json");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Validate with Zod
        const parseResult = schemas.Candidate.array().safeParse(data);
        if (!parseResult.success) {
          throw new Error(`Invalid data format: ${parseResult.error.message}`);
        }

        setCandidates(parseResult.data);
      } catch (e: any) {
        console.error("Failed to fetch candidates:", e);
        setError(
          `Failed to load candidates: ${e.message}. Make sure 'public/candidates.json' exists and is valid.`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  const filteredAndSortedResults = useMemo(() => {
    let processedCandidates = [...candidates];

    // Filtering
    if (filterText.trim()) {
      const lowerCaseFilter = filterText.toLowerCase();
      processedCandidates = processedCandidates.filter(
        (candidate) =>
          candidate.cv.summary.toLowerCase().includes(lowerCaseFilter) ||
          candidate.cv.fileName.toLowerCase().includes(lowerCaseFilter)
      );
    }
    return processedCandidates;
  }, [filterText, candidates]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Candidate Management
      </h1>

      <div className="controls bg-card p-4 rounded-lg shadow mb-6 flex flex-wrap items-end gap-4">
        {/* Filtering */}
        <div className="flex-grow min-w-[200px]">
          <Label
            htmlFor="filterInput"
            className="mb-1 block text-sm font-medium"
          >
            Filter by keyword:
          </Label>
          <Input
            id="filterInput"
            type="text"
            placeholder="Search summaries, filenames..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {loading && (
        <p className="text-center text-blue-500">Loading candidates...</p>
      )}
      {error && (
        <p className="text-center text-red-500 bg-red-100 p-3 rounded">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div>
          {filteredAndSortedResults.length > 0 ? (
            filteredAndSortedResults.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <p className="text-center text-gray-500">
              No candidates found matching your criteria.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
