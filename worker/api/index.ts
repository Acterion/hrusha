import { Env } from "../index";
import { handleCvUpload } from "./routes/cv-upload";
import { getCandidates } from "./routes/candidates";
import { cliRouter } from "./routes/cli-bridge";
import { handleRescanCVs } from "./routes/rescan-cvs";
import { ExecutionContext } from "@cloudflare/workers-types";

export async function apiRouter(
  request: Request,
  env: Env,
  ctx: ExecutionContext
) {
  const url = new URL(request.url);

  if (url.pathname === "/api/cv/upload") {
    return handleCvUpload(request, env);
  }

  if (url.pathname === "/api/candidates") {
    return getCandidates(request, env);
  }

  if (url.pathname.startsWith("/api/cli/")) {
    return cliRouter(request, env);
  }

  if (url.pathname === "/api/rescan-cvs") {
    return handleRescanCVs(request, env, ctx);
  }

  return new Response("Not Found", { status: 404 });
}
