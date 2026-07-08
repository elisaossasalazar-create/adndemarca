import { POINTS, type PointsConfig } from "@/lib/challenges";
import { getSetting } from "@/lib/db";

export function getEffectivePoints(): PointsConfig {
  return {
    JOURNAL_DAILY: parseInt(getSetting("points_journal") ?? "") || POINTS.JOURNAL_DAILY,
    WEEKLY_HOTMART: parseInt(getSetting("points_weekly") ?? "") || POINTS.WEEKLY_HOTMART,
    EXTRA_CHALLENGE: parseInt(getSetting("points_extra") ?? "") || POINTS.EXTRA_CHALLENGE,
  };
}
