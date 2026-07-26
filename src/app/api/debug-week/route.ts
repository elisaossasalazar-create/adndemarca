import { NextResponse } from "next/server";
import { getCurrentWeek, getCourseStartDate } from "@/lib/course";

export async function GET() {
  const now = new Date();
  const start = getCourseStartDate();
  const week2Base = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dow = week2Base.getUTCDay();
  const daysToSun = dow === 0 ? 0 : 7 - dow;
  const week2Start = new Date(week2Base.getTime() + daysToSun * 24 * 60 * 60 * 1000);

  return NextResponse.json({
    server_now_utc: now.toISOString(),
    course_start_env: process.env.COURSE_START_DATE ?? "(no definida, usando default)",
    course_start_resolved: start.toISOString(),
    week2_starts: week2Start.toISOString().slice(0, 10),
    current_week: getCurrentWeek(),
  });
}
