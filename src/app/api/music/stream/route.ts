import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("id");
    if (!videoId) {
      return NextResponse.json({ success: false, error: "Missing video ID" }, { status: 400 });
    }

    const ytdlpPath = process.env.YTDLP_PATH || "yt-dlp";

    const { stdout } = await execFileAsync(ytdlpPath, [
      `https://www.youtube.com/watch?v=${videoId}`,
      "-f", "bestaudio/best",
      "-g",
      "--no-warnings",
      "--no-check-certificates",
    ], { timeout: 30000 });

    const streamUrl = stdout.trim().split("\n")[0];
    if (!streamUrl) {
      return NextResponse.json({ success: false, error: "ບໍ່ສາມາດດຶງ audio stream ໄດ້" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { streamUrl } });
  } catch (error) {
    console.error("Music stream error:", error);
    return NextResponse.json(
      { success: false, error: "ບໍ່ສາມາດດຶງ audio ໄດ້" },
      { status: 500 }
    );
  }
}
