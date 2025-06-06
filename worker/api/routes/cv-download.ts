import { Env } from "../..";

export async function handleCvDownload(request: Request, env: Env) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const candidateId = searchParams.get("candidateId") || "";
  const fileName = searchParams.get("fileName") || "";
  if (!candidateId || !fileName) {
    return new Response("Missing candidateId or fileName", { status: 400 });
  }
  const bucket = env.CV_BUCKET;
  try {
    const object = await bucket.get(`${candidateId}/${fileName}`);
    if (!object) {
      return new Response("File not found", { status: 404 });
    }
    const fileContent = await object.arrayBuffer();
    return new Response(fileContent, {
      headers: {
        "Content-Type": "application/pdf", // Adjust based on actual file type
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error fetching CV file:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
