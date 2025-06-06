import { Env } from "../../index";

export async function getCandidates(request: Request, env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM candidates ORDER BY lastUpdated DESC`
  ).all();

  return Response.json(results);
}

export async function getCandidate(
  request: Request,
  env: Env,
  candidateId: string
) {
  if (!candidateId) {
    return new Response("Candidate ID is required", { status: 400 });
  }
  const { results } = await env.DB.prepare(
    `SELECT * FROM candidates WHERE id = ?`
  )
    .bind(candidateId)
    .run();
  if (results.length === 0) {
    return new Response("Candidate not found", { status: 404 });
  }

  return Response.json(results[0]);
}

export async function updateCandidateStatus(
  request: Request,
  env: Env,
  candidateId: string,
  status: string
) {
  const { results } = await env.DB.prepare(
    `UPDATE candidates SET status = ? WHERE id = ?`
  )
    .bind(status, candidateId)
    .run();

  return Response.json(results);
}
