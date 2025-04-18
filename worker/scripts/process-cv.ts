import { Env } from "../index";

export async function processCV(
  candidateId: string,
  filename: string,
  env: Env
) {
  const key = `${candidateId}/${filename}`;

  try {
    // Get CV file from R2
    const cv = await env.CV_BUCKET.get(key);
    if (!cv) return { success: false, error: "CV not found" };

    const cvText = await cv.text();

    // Process with AI
    const summary = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
      prompt: `Analyze this CV and provide a summary of skills, experience, and suitability: ${cvText}`,
      max_tokens: 500,
    });

    // Update DB with results and store etag as hash
    const etag = cv.etag || crypto.randomUUID();
    await env.DB.prepare(
      `UPDATE candidates SET summary = ?, status = 'processed', file_hash = ? WHERE id = ?`
    )
      .bind(summary.trim(), etag, candidateId)
      .run();

    return { success: true, summary: summary.trim() };
  } catch (error) {
    console.error("CV processing error:", error);
    // Mark as failed in DB
    await env.DB.prepare(
      `UPDATE candidates SET status = 'failed', error_message = ? WHERE id = ?`
    )
      .bind(error.message, candidateId)
      .run();

    return { success: false, error: error.message };
  }
}
