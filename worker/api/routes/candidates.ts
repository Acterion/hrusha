import { Env } from "../../index";

export async function getCandidates(request: Request, env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM candidates ORDER BY lastUpdated DESC`
  ).all();

  return Response.json(results);
}
