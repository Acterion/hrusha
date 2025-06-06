import { Env } from "../index";
import { handleCvUpload } from "./routes/cv-upload";
import {
  getCandidate,
  getCandidates,
  updateCandidateStatus,
} from "./routes/candidates";
import { cliRouter } from "./routes/cli-bridge";
import { handleRescanCVs } from "./routes/rescan-cvs";
import { ExecutionContext } from "@cloudflare/workers-types";
import { checkCvProcessingWorkflow } from "./workflows/cv-workflow";
import { handleCvDownload } from "./routes/cv-download";

export async function apiRouter(
  request: Request,
  env: Env,
  ctx: ExecutionContext
) {
  const url = new URL(request.url);

  if (url.pathname === "/api/cv-upload") {
    return handleCvUpload(request, env);
  }

  if (url.pathname === "/api/cv-workflow") {
    if (request.method === "GET") {
      return checkCvProcessingWorkflow(request, env);
    }
  }

  if (url.pathname === "/api/candidates") {
    if (request.method === "GET") {
      return getCandidates(request, env);
    }
  }

  if (url.pathname === "/api/candidate") {
    if (request.method === "POST") {
      const { candidateId, status } = (await request.json()) as {
        candidateId: string;
        status: string;
      };
      return updateCandidateStatus(request, env, candidateId, status);
    }
  }

  if (url.pathname === "/api/candidate") {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const searchParams = url.searchParams;
      const candidateId = searchParams.get("candidateId") || "";
      return getCandidate(request, env, candidateId);
    }
  }

  if (url.pathname.startsWith("/api/cli/")) {
    return cliRouter(request, env);
  }

  if (url.pathname === "/api/rescan-cvs") {
    return handleRescanCVs(request, env, ctx);
  }

  if (url.pathname === "/api/cv-download") {
    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    return handleCvDownload(request, env);
  }

  return new Response("Not Found", { status: 404 });
}
