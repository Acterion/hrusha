import { useState, useEffect, useMemo } from "react";
import { SummaryResult, SortField, SortOrder } from "@/types";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "./App.css"; // Optional custom styles

function App() {
  const [results, setResults] = useState<SummaryResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from the public directory (served at root by Vite)
        const response = await fetch("/results.json"); // Fetch from public/results.json
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: SummaryResult[] = await response.json();
        setResults(data);
      } catch (e: any) {
        console.error("Failed to fetch results:", e);
        setError(
          `Failed to load results: ${e.message}. Make sure 'public/results.json' exists and is valid JSON.`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  const filteredAndSortedResults = useMemo(() => {
    let processedResults = [...results];

    // Filtering
    if (filterText.trim()) {
      const lowerCaseFilter = filterText.toLowerCase();
      processedResults = processedResults.filter(
        (result) =>
          result.summary.toLowerCase().includes(lowerCaseFilter) ||
          result.originalFilename.toLowerCase().includes(lowerCaseFilter) ||
          result.originalText.toLowerCase().includes(lowerCaseFilter) // Filter original text too?
      );
    }

    // Sorting
    processedResults.sort((a, b) => {
      let compareA = a[sortField];
      let compareB = b[sortField];

      // Ensure consistent type for comparison if mixing numbers/strings
      if (sortField === "timestamp") {
        compareA = Number(compareA);
        compareB = Number(compareB);
      } else {
        compareA = String(compareA).toLowerCase();
        compareB = String(compareB).toLowerCase();
      }

      let comparison = 0;
      if (compareA > compareB) {
        comparison = 1;
      } else if (compareA < compareB) {
        comparison = -1;
      }

      return sortOrder === "asc" ? comparison : comparison * -1;
    });

    return processedResults;
  }, [results, sortField, sortOrder, filterText]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        AI Summarization Results
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

        {/* Sorting */}
        <div className="flex-grow-0">
          <Label htmlFor="sortField" className="mb-1 block text-sm font-medium">
            Sort by:
          </Label>
          <Select
            value={sortField}
            onValueChange={(value) => setSortField(value as SortField)}
          >
            <SelectTrigger className="w-[180px]" id="sortField">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp">Date</SelectItem>
              <SelectItem value="summary">Summary Content</SelectItem>
              {/* Add more sortable fields here */}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-grow-0">
          <Button onClick={toggleSortOrder} variant="outline">
            Sort {sortOrder === "asc" ? "Ascending" : "Descending"} (
            {sortOrder === "asc" ? "▲" : "▼"})
          </Button>
        </div>
      </div>

      {loading && (
        <p className="text-center text-blue-500">Loading results...</p>
      )}
      {error && (
        <p className="text-center text-red-500 bg-red-100 p-3 rounded">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div>
          {filteredAndSortedResults.length > 0 ? (
            filteredAndSortedResults.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))
          ) : (
            <p className="text-center text-gray-500">
              No results found matching your criteria.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
