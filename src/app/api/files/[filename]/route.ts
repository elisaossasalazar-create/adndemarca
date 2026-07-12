import path from "node:path";
import { readFile } from "node:fs/promises";

const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

const EXT_TO_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  "3gp": "video/3gpp",
  pdf: "application/pdf",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  // Prevent path traversal
  const safe = path.basename(filename);

  try {
    const buffer = await readFile(path.join(UPLOADS_DIR, safe));
    const ext = safe.split(".").pop()?.toLowerCase() ?? "";
    const contentType = EXT_TO_TYPE[ext] ?? "application/octet-stream";

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
