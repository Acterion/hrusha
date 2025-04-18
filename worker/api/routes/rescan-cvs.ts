import { Env } from "../..";
import { processCV } from "../../scripts/process-cv";
import { ExecutionContext } from "@cloudflare/workers-types";

export async function handleRescanCVs(
  request: Request,
  env: Env,
  ctx: ExecutionContext
) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // Find all candidates that need processing
    const { results } = await env.DB.prepare(
      `SELECT id, filename FROM candidates WHERE status IN ('pending', 'failed', 'uploading') OR summary IS NULL`
    ).all<{ id: string; filename: string }>();

    if (results.length === 0) {
      return Response.json({ message: "No CVs need processing" });
    }

    // Update candidates to show they're being processed
    const ids = results.map((r) => r.id);
    await env.DB.prepare(
      `UPDATE candidates SET status = 'processing' WHERE id IN (${ids
        .map(() => "?")
        .join(",")})`
    )
      .bind(...ids)
      .run();

    // Start processing but don't wait for completion
    const processingPromise = Promise.all(
      results.map((candidate) =>
        processCV(candidate.id, candidate.filename, env)
      )
    );

    // Don't block the response
    ctx.waitUntil(processingPromise);

    return Response.json({
      message: `Processing ${results.length} CVs`,
      count: results.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
