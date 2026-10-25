import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "cv");
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "No CV file provided." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { message: "File exceeds maximum size of 10 MB." },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name).toLowerCase() || ".pdf";
    const allowedExts = [".pdf", ".doc", ".docx"];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { message: "Only PDF, DOC, or DOCX files are supported." },
        { status: 400 }
      );
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const safeBase = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 48);
    const uniqueName = `${Date.now()}-${safeBase}${ext}`;
    const destPath = path.join(UPLOAD_DIR, uniqueName);

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(destPath, Buffer.from(arrayBuffer));

    const publicUrl = `/uploads/cv/${uniqueName}`;

    return NextResponse.json({
      url: publicUrl,
      fileName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("POST /api/hiring/upload error:", error);
    return NextResponse.json(
      { message: "Failed to upload CV file." },
      { status: 500 }
    );
  }
}

