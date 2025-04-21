import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from "cloudflare:workers";
import { Env } from "../../index";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export class CvProcessingWorkflow extends WorkflowEntrypoint<
  Env,
  { candidateId: string; fileName: string }
> {
  async run(
    event: WorkflowEvent<{ candidateId: string; fileName: string }>,
    step: WorkflowStep
  ) {
    const { candidateId, fileName } = event.payload;
    console.log("Processing CV for candidate:", candidateId);
    // 1) Retrieve CV from R2
    const fileBuffer = await step.do("retrieve CV", async () => {
      const object = await this.env.CV_BUCKET.get(`${candidateId}/${fileName}`);
      if (!object) throw new Error("CV not found in bucket");
      return await object.arrayBuffer();
    });

    // 2) Summarize using Vercel AI SDK
    const summary = await step.do("summarize CV", async () => {
      const text = new TextDecoder().decode(fileBuffer);
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: `Provide a concise summary of the following CV:\n${text}`,
      });
      return result.text;
    });

    await step.do("update summary in DB", async () => {
      await this.env.DB.prepare(
        `UPDATE candidates SET cv = json_set(cv, '$.summary', ?) WHERE id = ?`
      )
        .bind(summary, candidateId)
        .run();
    });

    // 3) Grade CV (mock implementation)
    const gradesEval = await step.do("grade CV", async () => {
      return [
        {
          name: "readability",
          reason: "Text is clear and well-structured",
          value: "yes",
        },
        {
          name: "experience",
          reason: "Relevant work experience",
          value: "maybe",
        },
      ];
    });

    await step.do("update grades in DB", async () => {
      await this.env.DB.prepare(
        `UPDATE candidates SET cv = json_set(cv, '$.gradesEval', ?) WHERE id = ?`
      )
        .bind(JSON.stringify(gradesEval), candidateId)
        .run();
    });

    // 4) Mark processing as completed
    await step.do("finalize status", async () => {
      await this.env.DB.prepare(
        `UPDATE candidates SET cv = json_set(cv, '$.fileStatus', 'completed') WHERE id = ?`
      )
        .bind(candidateId)
        .run();
    });
  }
}

export const checkCvProcessingWorkflow = async (req: Request, env: Env) => {
  const instanceId = new URL(req.url).searchParams.get("instanceId") || "";
  console.log("Checking workflow status for instanceId:", instanceId);
  console.log((await env.CV_WORKFLOW.get(instanceId)).status());
  const workflow = await env.CV_WORKFLOW.get(instanceId);
  if (!workflow) {
    return new Response("Workflow not found", { status: 404 });
  }

  return new Response(`Workflow status: ${(await workflow).status()}`, {
    status: 200,
  });
};
export default {};
