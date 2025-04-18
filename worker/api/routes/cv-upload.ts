import { Env } from "../../index";
import { processCV } from "../../scripts/process-cv";
import { createCandidate, createCV, createHA } from "../../../types/factories";
import { calculateFileHash } from "../../utils/file-utils";

export async function handleCvUpload(request: Request, env: Env) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const formData = await request.formData();
    const cvFile = formData.get("cv") as File;
    const name = formData.get("name") as string;
    const surname = formData.get("name") as string;
    const email = formData.get("email") as string;
    const candidateId = crypto.randomUUID();

    if (!cvFile) {
      return Response.json({ error: "No CV file provided" }, { status: 400 });
    }

    // Calculate file hash
    const fileContent = await cvFile.arrayBuffer();
    const fileHash = await calculateFileHash(fileContent);

    // Create CV object using factory
    const cv = createCV({
      id: crypto.randomUUID(),
      name,
      surname,
      email,
      fileName: cvFile.name,
      fileHash,
      fileStatus: "processing",
      summary: "", // Will be populated during processing
    });

    // Create HA object
    const ha = createHA();

    // Create the complete candidate object
    const candidate = createCandidate({
      id: candidateId,
      name,
      surname,
      cv,
      ha,
      status: "applied",
      decision: "maybe",
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    });

    // Add record to database - adjust fields to match our schema
    await env.DB.prepare(
      `INSERT INTO candidates (id, name, surname, cv, ha, status, decision, lastUpdated, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        candidate.id,
        candidate.name,
        candidate.surname,
        JSON.stringify(candidate.cv),
        JSON.stringify(candidate.ha),
        candidate.status,
        candidate.decision,
        candidate.lastUpdated,
        candidate.createdAt
      )
      .run();

    // Store the CV file in the bucket
    await env.CV_BUCKET.put(`${candidateId}/${cvFile.name}`, fileContent);

    // const processingResult = await processCV(candidateId, cvFile.name, env);

    return Response.json({
      success: true,
      candidateId,
      candidate,
      // processingComplete: processingResult.success,
    });
  } catch (error) {
    console.error("Error processing CV upload:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
