import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  return handleCleanup(req);
}

export async function POST(req: Request) {
  return handleCleanup(req);
}

async function handleCleanup(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Prune ClickEvents older than 30 days
    const deletedClicks = await prisma.clickEvent.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    // 2. Prune completed or failed Jobs older than 7 days
    const deletedJobs = await prisma.job.deleteMany({
      where: {
        status: { in: ["COMPLETED", "FAILED"] },
        updatedAt: { lt: sevenDaysAgo },
      },
    });

    return NextResponse.json({
      success: true,
      deletedClicksCount: deletedClicks.count,
      deletedJobsCount: deletedJobs.count,
      durationMs: Date.now() - startTime,
    });
  } catch (err) {
    console.error("[cleanup-worker] Fatal error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
