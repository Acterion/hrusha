import {
  D1Database,
  R2Bucket,
  Fetcher,
  ExecutionContext,
  Workflow,
} from "@cloudflare/workers-types";
import { apiRouter } from "./api";
import { CvProcessingWorkflow } from "./api/workflows/cv-workflow";

export interface Env {
  DB: D1Database;
  CV_BUCKET: R2Bucket;
  AI: any;
  ASSETS: Fetcher;
  CV_WORKFLOW: Workflow;
}

export { CvProcessingWorkflow };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      console.log("API route:", url.pathname);
      return apiRouter(request, env, ctx);
    }

    // For all other routes, let Cloudflare serve the assets
    // The not_found_handling: "single-page-application" setting in wrangler.jsonc
    // will automatically serve index.html when a static asset can't be found
    return env.ASSETS.fetch(request.url);
  },
};
