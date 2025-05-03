import { Env } from "../../index";

export async function getCandidates(request: Request, env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM candidates ORDER BY lastUpdated DESC`
  ).all();

  return Response.json(results);
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
