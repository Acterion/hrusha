import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { generateText } from "ai";

// *** Update this import path ***
import { run as runSummarizeScript } from "./summarize-text"; // Changed from '../../cli/scripts/summarize-text'

// Mock dependencies (paths using path.resolve(__dirname, '../..') should still be correct)
vi.mock("fs/promises");
vi.mock("ai", async (importOriginal) => {
  // ... (rest of mock setup remains the same)
  const original = (await importOriginal()) as any;
  return {
    ...original,
    generateText: vi.fn(),
  };
});
vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn().mockReturnValue({
    /* mock model object if needed */
  }),
}));

// --- Mocks Setup ---
// Paths resolved from __dirname should still work as __dirname is now cli/scripts/
// and ../../ correctly points to the project root.
const mockInputText = "This is the input text to be summarized.";
const mockSummary = "Input text summarized.";
const mockExistingResults: any[] = [
  {
    id: "sum-123",
    timestamp: 1678886400000,
    originalFilename: "old.txt",
    originalText: "Old text",
    summary: "Old summary",
  },
];
const mockOutputFile = path.resolve(__dirname, "../../public/results.json");
const mockInputFile = path.resolve(__dirname, "../../data/input/example.txt");

describe("CLI Script: summarize-text", () => {
  let originalProcessEnv: NodeJS.ProcessEnv;
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // ... (setup remains the same)
    originalProcessEnv = { ...process.env };
    process.env.OPENAI_API_KEY = "test-api-key";
    vi.resetAllMocks();
    vi.mocked(fs.readFile).mockResolvedValue(mockInputText);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.access).mockImplementation(async (filePath) => {
      if (filePath === mockOutputFile) return undefined; // Assume exists by default
      throw new Error(`Unexpected access call to ${filePath}`);
    });
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
      if (filePath === mockInputFile) return mockInputText;
      if (filePath === mockOutputFile)
        return JSON.stringify(mockExistingResults);
      throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
    });
    vi.mocked(generateText).mockResolvedValue({
      text: mockSummary,
      toolCalls: [],
      toolResults: [],
      finishReason: "stop",
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      response: undefined,
      warnings: undefined,
      reasoning: "",
      files: [],
      reasoningDetails: [],
      sources: [],
      experimental_output: undefined,
      steps: [],
      request: {
        body: "",
      },
      logprobs: [],
      providerMetadata: undefined,
      experimental_providerMetadata: undefined,
    });
    exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // ... (teardown remains the same)
    process.env = originalProcessEnv;
    vi.restoreAllMocks();
  });

  // ... (all 'it' test cases remain the same) ...
  it("should successfully read input, generate summary, and write output", async () => {
    // Arrange
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(mockInputText) // Read input
      .mockResolvedValueOnce(JSON.stringify(mockExistingResults)); // Read existing

    // Act
    await runSummarizeScript();

    // Assert
    expect(fs.readFile).toHaveBeenCalledWith(mockInputFile, "utf-8");
    expect(generateText).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    const writeFileCall = vi.mocked(fs.writeFile).mock.calls[0];
    expect(writeFileCall[0]).toBe(mockOutputFile);
    const writtenData = JSON.parse(writeFileCall[1] as string);
    expect(writtenData).toHaveLength(mockExistingResults.length + 1);
    expect(writtenData[writtenData.length - 1]).toMatchObject({
      originalFilename: "example.txt",
      originalText: mockInputText,
      summary: mockSummary,
    });
    expect(exitSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should create a new results file if it does not exist", async () => {
    // Arrange
    const enoentError = new Error("ENOENT: no such file or directory");
    (enoentError as any).code = "ENOENT";
    vi.mocked(fs.access).mockRejectedValue(enoentError); // File doesn't exist
    // Need to adjust readFile mock for this specific case if access fails
    vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
      if (filePath === mockInputFile) return mockInputText;
      // If trying to read the non-existent output file, it should also fail or return differently
      if (filePath === mockOutputFile) throw enoentError;
      throw new Error(`Unexpected read call to ${filePath}`);
    });

    // Act
    await runSummarizeScript();

    // Assert
    expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(mockOutputFile), {
      recursive: true,
    });
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    const writeFileCall = vi.mocked(fs.writeFile).mock.calls[0];
    const writtenData = JSON.parse(writeFileCall[1] as string);
    expect(writtenData).toHaveLength(1);
    expect(writtenData[0].summary).toBe(mockSummary);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("results.json not found, creating a new one.")
    );
    expect(exitSpy).not.toHaveBeenCalled();
  });

  // Other tests (API key missing, input read fail, AI fail) remain the same...
  it("should exit if OPENAI_API_KEY is not set", async () => {
    delete process.env.OPENAI_API_KEY;
    await runSummarizeScript();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("OPENAI_API_KEY environment variable is not set")
    );
  });

  it("should exit if input file reading fails", async () => {
    const readError = new Error("Failed to read input");
    vi.mocked(fs.readFile).mockRejectedValueOnce(readError); // Simulate input read error only for input file
    vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
      if (filePath === mockInputFile) throw readError;
      // Allow reading output file for this test case if needed, or adjust
      if (filePath === mockOutputFile)
        return JSON.stringify(mockExistingResults);
      throw new Error(`Unexpected read call to ${filePath}`);
    });

    await runSummarizeScript();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Error reading input file`),
      readError
    );
  });

  it("should exit if AI summarization fails", async () => {
    const aiError = new Error("AI API error");
    vi.mocked(generateText).mockRejectedValue(aiError);

    // Ensure input file reads successfully for this test
    vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
      if (filePath === mockInputFile) return mockInputText;
      if (filePath === mockOutputFile)
        return JSON.stringify(mockExistingResults);
      throw new Error(`Unexpected read call to ${filePath}`);
    });

    await runSummarizeScript();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error generating summary via Vercel AI SDK:"),
      aiError
    );
  });
});
