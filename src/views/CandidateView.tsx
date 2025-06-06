import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Separator } from "@/app/components/ui/separator";
import {
  ArrowLeft,
  FileText,
  Code,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { z } from "zod";
import { DecisionEnum, CandidateSchema } from "@/types/schemas";

// Mock data as fallback if API fails
const mockCandidate = {
  id: "1",
  name: "Nikita",
  surname: "Shishelyakin",
  email: "nikita@example.com",
  cv: {
    id: "cv1",
    phone: "+1234567890",
    summary:
      "Experienced software engineer with 5 years of experience in React and TypeScript.",
    gradesEval: [
      {
        name: "Technical Skills",
        reason: "Strong React and TypeScript experience",
        value: "4/5",
      },
      {
        name: "Communication",
        reason: "Clear and concise in written application",
        value: "3/5",
      },
    ],
    fileName: "nikita_cv.pdf",
    fileHash: "abc123",
    fileStatus: "completed",
  },
  ha: {
    id: "ha1",
    name: "Frontend Challenge",
    repo: "https://github.com/nikita/frontend-challenge",
    description: "Build a responsive dashboard with React and TypeScript",
    status: "completed",
    grades: [
      {
        name: "Code Quality",
        description: "Clean, maintainable code with good practices",
        scale: "1-5",
      },
      {
        name: "UI/UX",
        description: "User interface design and experience",
        scale: "1-5",
      },
    ],
    gradesEval: [
      {
        name: "Code Quality",
        reason: "Well-structured components with good separation of concerns",
        value: "4/5",
      },
      {
        name: "UI/UX",
        reason: "Clean design but lacking some responsive features",
        value: "3/5",
      },
    ],
  },
  decision: "maybe",
  status: "applied",
  lastUpdated: Date.now() - 86400000, // 1 day ago
  createdAt: Date.now() - 604800000, // 1 week ago
  fingerprint: "nikita_shishelyakin_nikita@example.com",
};

export default function CandidateView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<z.infer<
    typeof CandidateSchema
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!id) {
        setError("No candidate ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("candidateId", id);
        const response = await fetch(`/api/candidate?${params}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch candidate: ${response.statusText}`);
        }

        const data = await response.json();

        // Parse nested JSON if needed (similar to Pipeline.tsx)
        const parsedData = {
          ...data,
          cv: typeof data.cv === "string" ? JSON.parse(data.cv) : data.cv,
          ha: typeof data.ha === "string" ? JSON.parse(data.ha) : data.ha,
        };

        // Validate with schema
        const parseResult = CandidateSchema.safeParse(parsedData);

        if (!parseResult.success) {
          throw new Error(`Invalid data format: ${parseResult.error.message}`);
        }

        setCandidate(parseResult.data);
      } catch (error) {
        console.error("Error fetching candidate:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load candidate data"
        );

        // Fallback to mock data in development environment
        if (process.env.NODE_ENV === "development") {
          console.warn("Using mock data as fallback");
          setCandidate(mockCandidate as z.infer<typeof CandidateSchema>);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [id]);

  const downloadCV = () => {
    if (!candidate || !candidate.cv.fileName || !candidate.cv.fileHash) {
      setError("CV file not available for download");
      return;
    }
    const url = `/api/cv-download?candidateId=${candidate.id}&fileName=${candidate.cv.fileName}`;
    window.open(url, "_blank");
  };

  const getDecisionColor = (decision: z.infer<typeof DecisionEnum>) => {
    switch (decision) {
      case "strong_yes":
        return "bg-green-500 hover:bg-green-600";
      case "yes":
        return "bg-green-400 hover:bg-green-500";
      case "maybe":
        return "bg-yellow-400 hover:bg-yellow-500";
      case "no":
        return "bg-red-400 hover:bg-red-500";
      case "strong_no":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-400 hover:bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "not_started":
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Candidate Not Found</h1>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pipeline
        </Button>
      </div>
    );
  }

  if (error && !candidate) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-2">Error Loading Candidate</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pipeline
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pipeline
        </Button>
        <h1 className="text-3xl font-bold">Candidate Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">
                {candidate.name} {candidate.surname}
              </CardTitle>
              <CardDescription>{candidate.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Phone
                </p>
                <p>{candidate.cv.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <Badge className="mt-1 capitalize">
                  {candidate.status.replace(/([A-Z])/g, " $1").trim()}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Decision
                </p>
                <Badge
                  className={`mt-1 capitalize ${getDecisionColor(
                    candidate.decision
                  )}`}
                >
                  {candidate.decision.replace(/_/g, " ")}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  AI Suggestion
                </p>
                <Badge
                  className={`mt-1 capitalize ${getDecisionColor(
                    candidate.aiDecision
                  )}`}
                >
                  {candidate.aiDecision.replace(/_/g, " ")}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Applied
                </p>
                <p>{formatDate(candidate.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </p>
                <p>{formatDate(candidate.lastUpdated)}</p>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex space-x-2 w-full">
                <Button variant="outline" className="w-1/2">
                  Update Status
                </Button>
                <Button variant="outline" className="w-1/2">
                  Change Decision
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="cv" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cv">
                <FileText className="mr-2 h-4 w-4" /> CV
              </TabsTrigger>
              <TabsTrigger value="ha">
                <Code className="mr-2 h-4 w-4" /> Home Assignment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cv" className="mt-4">
              <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>CV Details</CardTitle>
                    <Badge
                      variant={
                        candidate.cv.fileStatus === "completed"
                          ? "default"
                          : "outline"
                      }
                    >
                      {candidate.cv.fileStatus}
                    </Badge>
                  </div>
                  <CardDescription>
                    File: {candidate.cv.fileName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Summary</h3>
                      <p className="mt-1 text-muted-foreground">
                        {candidate.cv.summary}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Evaluations</h3>
                      <div className="space-y-3">
                        {candidate.cv.gradesEval.map((evaluation, index) => (
                          <div key={index} className="bg-muted p-3 rounded-md">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{evaluation.name}</h4>
                              <Badge variant="outline">
                                {evaluation.value}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {evaluation.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={downloadCV}>
                    Download CV
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="ha" className="mt-4">
              <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{candidate.ha.name}</CardTitle>
                    <div className="flex items-center">
                      {getStatusIcon(candidate.ha.status)}
                      <Badge variant="outline" className="ml-2 capitalize">
                        {candidate.ha.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Repository:{" "}
                    <a
                      href={candidate.ha.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {candidate.ha.repo}
                    </a>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Description</h3>
                      <p className="mt-1 text-muted-foreground">
                        {candidate.ha.description}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Evaluations</h3>
                      <div className="space-y-3">
                        {candidate.ha.gradesEval.map((evaluation, index) => (
                          <div key={index} className="bg-muted p-3 rounded-md">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{evaluation.name}</h4>
                              <Badge variant="outline">
                                {evaluation.value}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {evaluation.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    onClick={() => window.open(candidate.ha.repo, "_blank")}
                  >
                    View Repository
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
