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
    const query = searchParams.get("q");
    if (!query) {
      return NextResponse.json({ success: false, error: "ກະລຸນາປ້ອນຄຳຄົ້ນຫາ" }, { status: 400 });
    }

    const ytdlpPath = process.env.YTDLP_PATH || "yt-dlp";

    const { stdout } = await execFileAsync(ytdlpPath, [
      `ytsearch10:${query}`,
      "--dump-json",
      "--flat-playlist",
      "--no-warnings",
      "--default-search", "ytsearch",
    ], { timeout: 15000 });

    const results = stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          const data = JSON.parse(line);
          return {
            youtubeId: data.id,
            title: data.title,
            thumbnailUrl: data.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${data.id}/mqdefault.jpg`,
            duration: data.duration || null,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Music search error:", error);
    return NextResponse.json(
      { success: false, error: "ບໍ່ສາມາດຄົ້ນຫາໄດ້ - ກວດສອບ yt-dlp" },
      { status: 500 }
    );
  }
}
