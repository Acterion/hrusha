import { createCandidate, createCV, createHA } from "@/types/factories";
import { Candidate, Decision, Status } from "@/types";

/**
 * Generates a specified number of fake candidates for development and testing
 * @param count Number of candidates to generate
 * @returns Array of fake candidate objects
 */
export function generateFakeCandidates(count: number = 8): Candidate[] {
  const names = [
    "John",
    "Jane",
    "Michael",
    "Emily",
    "David",
    "Sarah",
    "Robert",
    "Jessica",
  ];
  const surnames = [
    "Doe",
    "Smith",
    "Johnson",
    "Brown",
    "Wilson",
    "Miller",
    "Taylor",
    "Anderson",
  ];
  const jobTitles = [
    "Frontend Developer with React experience",
    "Senior Backend Developer specializing in Node.js",
    "Full-stack Developer with React, Node.js, and AWS",
    "DevOps Engineer with CI/CD and Kubernetes expertise",
    "Mobile Developer with React Native and Flutter",
    "UI/UX Designer with web and mobile application portfolio",
    "Data Scientist with machine learning and Python expertise",
    "Product Manager with agile methodologies experience",
  ];

  const statuses = Object.values(Status);

  const decisions = Object.values(Decision);

  return Array.from({ length: count }, (_, i) => {
    const index = i % 8; // Ensures we cycle through our arrays if count > 8
    const name = names[index];
    const surname = surnames[index];
    const jobTitle = jobTitles[index];
    const status = statuses[index];
    const decision = decisions[Math.min(index % 5, 4)];

    // Score between 30 and 95
    const score = 30 + Math.floor(Math.random() * 66);

    // Time offsets (for createdAt and lastUpdated)
    const dayMs = 86400000; // 1 day in milliseconds
    const createdAtOffset = dayMs * (i + 1) * 10; // Each candidate created further back in time
    const lastUpdatedOffset = dayMs * (i + 1); // Each candidate updated at different times

    const createdAt = Date.now() - createdAtOffset;
    const lastUpdated = Date.now() - lastUpdatedOffset;

    // Create CV with relevant fake data
    const cv = createCV({
      name,
      surname,
      email: `${name.toLowerCase()}.${surname.toLowerCase()}@example.com`,
      summary: jobTitle,
      fileName: `${name.toLowerCase()}_${surname.toLowerCase()}_resume.pdf`,
    });

    const ha = createHA();

    // Create the complete candidate
    return createCandidate({
      name,
      surname,
      cv,
      ha,
      status,
      decision,
      createdAt,
      lastUpdated,
    });
  });
}

/**
 * Helper function to generate appropriate feedback based on score
 */
function getFeedbackForScore(score: number): string {
  if (score >= 90) return "Excellent solution with good architecture.";
  if (score >= 80) return "Great skills and attention to detail.";
  if (score >= 70) return "Good understanding of concepts and requirements.";
  if (score >= 60) return "Solution works but has some issues to address.";
  if (score >= 50) return "Average performance with room for improvement.";
  if (score >= 40) return "Solution incomplete and has major issues.";
  return "Poor code quality and incomplete solution.";
}
