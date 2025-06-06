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
    const surname = formData.get("surname") as string;
    const email = formData.get("email") as string;
    const candidateId = crypto.randomUUID();

    const fingerprint = name + surname + email;
    const existingCandidate = await env.DB.prepare(
      `SELECT * FROM candidates WHERE fingerprint = ?`
    )
      .bind(fingerprint)
      .first();

    if (!cvFile) {
      return Response.json({ error: "No CV file provided" }, { status: 400 });
    }
    if (existingCandidate) {
      return Response.json(
        { error: "Candidate already exists" },
        { status: 400 }
      );
    }

    const fileContent = await cvFile.arrayBuffer();
    const fileHash = await calculateFileHash(fileContent);

    const cv = createCV({
      id: crypto.randomUUID(),
      fileName: cvFile.name,
      fileHash,
      fileStatus: "processing",
      summary: "", // Will be populated during processing
    });

    const ha = createHA();

    const candidate = createCandidate({
      id: candidateId,
      name,
      surname,
      email,
      cv,
      ha,
      status: "applied",
      decision: "maybe",
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      fingerprint,
    });

    await env.DB.prepare(
      `INSERT INTO candidates (id, name, surname, email, cv, ha, status, decision, aiDecision, lastUpdated, createdAt, fingerprint) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        candidate.id,
        candidate.name,
        candidate.surname,
        candidate.email,
        JSON.stringify(candidate.cv),
        JSON.stringify(candidate.ha),
        candidate.status,
        candidate.decision,
        candidate.aiDecision,
        candidate.lastUpdated,
        candidate.createdAt,
        candidate.fingerprint
      )
      .run();

    await env.CV_BUCKET.put(`${candidateId}/${cvFile.name}`, fileContent);
    // trigger asynchronous processing via Cloudflare Workflow
    const wf = await env.CV_WORKFLOW.create({
      id: candidateId,
      params: { candidateId, fileName: cvFile.name },
    });
    console.log(
      "Workflow created:",
      wf.id,
      "check status at:",
      `${new URL(request.url).origin}/api/cv-workflow?instanceId=${wf.id}`
    );

    return Response.json({
      success: true,
      candidateId,
      candidate,
    });
  } catch (error) {
    console.error("Error processing CV upload:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
