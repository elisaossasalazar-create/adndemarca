import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
} catch { /* Railway volume may not be mounted yet; DB open will surface the real error */ }

const DB_PATH = path.join(DATA_DIR, "app.db");

declare global {
  var __db: DatabaseSync | undefined;
}

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    social_handle TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    contract_json TEXT NOT NULL,
    points_total INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS journal_completions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    completed_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, completed_date)
  )`,
  `CREATE TABLE IF NOT EXISTS weekly_completions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    week_number INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, week_number)
  )`,
  `CREATE TABLE IF NOT EXISTS extra_completions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    challenge_id TEXT NOT NULL,
    evidence_filename TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, challenge_id)
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS community_posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    user_name TEXT NOT NULL,
    week_number INTEGER NOT NULL,
    post_type TEXT NOT NULL DEFAULT 'reto',
    content TEXT NOT NULL DEFAULT '',
    file_name TEXT,
    file_type TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS community_comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES community_posts(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS brandstein_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
    messages_json TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL DEFAULT 'comment',
    message TEXT NOT NULL,
    post_id TEXT,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
];

function getDb(): DatabaseSync {
  if (!global.__db) {
    const db = new DatabaseSync(DB_PATH);
    global.__db = db;
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA busy_timeout = 5000");
    for (const sql of SCHEMA_STATEMENTS) {
      db.exec(sql);
    }
  }
  // migrations
  try { global.__db!.exec("ALTER TABLE community_posts ADD COLUMN post_type TEXT NOT NULL DEFAULT 'reto'"); } catch { /* column already exists */ }
  try { global.__db!.exec("ALTER TABLE notifications ADD COLUMN type TEXT NOT NULL DEFAULT 'comment'"); } catch { /* column already exists */ }

  return global.__db!
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  social_handle: string;
  password_hash: string;
  contract_json: string;
  points_total: number;
  created_at: string;
}

export interface ExtraCompletion {
  id: string;
  user_id: string;
  challenge_id: string;
  evidence_filename: string;
  created_at: string;
}

// ── Users ────────────────────────────────────────────────────────────────────

export function createUser(user: Omit<User, "created_at" | "points_total">): User {
  const db = getDb();
  db.prepare(
    `INSERT INTO users (id, full_name, email, phone, social_handle, password_hash, contract_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(user.id, user.full_name, user.email, user.phone, user.social_handle, user.password_hash, user.contract_json);
  return getUserById(user.id)!;
}

export function getUserByEmail(email: string): User | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim()) as User | undefined;
}

export function getUserById(id: string): User | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}

export function getAllUsers(): User[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM users ORDER BY points_total DESC").all() as unknown as User[];
  return rows.map((r) => ({ ...r }));
}

// ── Journal completions ───────────────────────────────────────────────────────

export function hasJournalForDate(userId: string, date: string): boolean {
  const db = getDb();
  return !!db.prepare("SELECT id FROM journal_completions WHERE user_id = ? AND completed_date = ?").get(userId, date);
}

export function getJournalDatesForUser(userId: string): string[] {
  const db = getDb();
  const rows = db.prepare("SELECT completed_date FROM journal_completions WHERE user_id = ? ORDER BY completed_date").all(userId) as { completed_date: string }[];
  return rows.map((r) => r.completed_date);
}

export function addJournalCompletion(userId: string, date: string, points: number): boolean {
  const db = getDb();
  try {
    db.exec("BEGIN");
    const existing = db.prepare("SELECT id FROM journal_completions WHERE user_id = ? AND completed_date = ?").get(userId, date);
    if (existing) { db.exec("ROLLBACK"); return false; }
    db.prepare("INSERT INTO journal_completions (id, user_id, completed_date) VALUES (?, ?, ?)").run(randomUUID(), userId, date);
    db.prepare("UPDATE users SET points_total = points_total + ? WHERE id = ?").run(points, userId);
    db.exec("COMMIT");
    return true;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

// ── Weekly Hotmart completions ────────────────────────────────────────────────

export function hasWeeklyCompletion(userId: string, weekNumber: number): boolean {
  const db = getDb();
  return !!db.prepare("SELECT id FROM weekly_completions WHERE user_id = ? AND week_number = ?").get(userId, weekNumber);
}

export function addWeeklyCompletion(userId: string, weekNumber: number, points: number): boolean {
  const db = getDb();
  try {
    db.exec("BEGIN");
    const existing = db.prepare("SELECT id FROM weekly_completions WHERE user_id = ? AND week_number = ?").get(userId, weekNumber);
    if (existing) { db.exec("ROLLBACK"); return false; }
    db.prepare("INSERT INTO weekly_completions (id, user_id, week_number) VALUES (?, ?, ?)").run(randomUUID(), userId, weekNumber);
    db.prepare("UPDATE users SET points_total = points_total + ? WHERE id = ?").run(points, userId);
    db.exec("COMMIT");
    return true;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

// ── Extra challenge completions ───────────────────────────────────────────────

export function hasAnyExtraForWeek(userId: string, weekChallengeIds: string[]): boolean {
  if (weekChallengeIds.length === 0) return false;
  const db = getDb();
  const placeholders = weekChallengeIds.map(() => "?").join(",");
  return !!db
    .prepare(`SELECT id FROM extra_completions WHERE user_id = ? AND challenge_id IN (${placeholders}) LIMIT 1`)
    .get(userId, ...weekChallengeIds);
}

export function hasExtraCompletion(userId: string, challengeId: string): boolean {
  const db = getDb();
  return !!db.prepare("SELECT id FROM extra_completions WHERE user_id = ? AND challenge_id = ?").get(userId, challengeId);
}

export function getExtraCompletionsForUser(userId: string): ExtraCompletion[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM extra_completions WHERE user_id = ?").all(userId) as unknown as ExtraCompletion[];
  return rows.map((r) => ({ ...r }));
}

export function getAllExtraCompletions(): ExtraCompletion[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM extra_completions ORDER BY user_id, created_at ASC").all() as unknown as ExtraCompletion[];
  return rows.map((r) => ({ ...r }));
}

export function addExtraCompletion(userId: string, challengeId: string, evidenceFilename: string, points: number): boolean {
  const db = getDb();
  try {
    db.exec("BEGIN");
    const existing = db.prepare("SELECT id FROM extra_completions WHERE user_id = ? AND challenge_id = ?").get(userId, challengeId);
    if (existing) { db.exec("ROLLBACK"); return false; }
    db.prepare("INSERT INTO extra_completions (id, user_id, challenge_id, evidence_filename) VALUES (?, ?, ?, ?)").run(randomUUID(), userId, challengeId, evidenceFilename);
    db.prepare("UPDATE users SET points_total = points_total + ? WHERE id = ?").run(points, userId);
    db.exec("COMMIT");
    return true;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function getSetting(key: string): string | undefined {
  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value;
}

export function setSetting(key: string, value: string): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(key, value);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminUserRow {
  id: string;
  full_name: string;
  email: string;
  social_handle: string;
  phone: string;
  points_total: number;
  created_at: string;
  journal_count: number;
  weekly_count: number;
  extra_count: number;
}

export function getAllUsersWithStats(): AdminUserRow[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT
         u.id, u.full_name, u.email, u.social_handle, u.phone,
         u.points_total, u.created_at,
         COUNT(DISTINCT j.id) AS journal_count,
         COUNT(DISTINCT w.id) AS weekly_count,
         COUNT(DISTINCT e.id) AS extra_count
       FROM users u
       LEFT JOIN journal_completions j ON j.user_id = u.id
       LEFT JOIN weekly_completions w  ON w.user_id  = u.id
       LEFT JOIN extra_completions  e  ON e.user_id  = u.id
       GROUP BY u.id
       ORDER BY u.points_total DESC`
    )
    .all() as unknown as AdminUserRow[];
  return rows.map((r) => ({ ...r }));
}

export function adjustUserPointsDelta(userId: string, delta: number): void {
  const db = getDb();
  db.prepare(
    "UPDATE users SET points_total = MAX(0, points_total + ?) WHERE id = ?"
  ).run(delta, userId);
}

export function deleteExtraCompletion(completionId: string, userId: string, pointsToDeduct: number): void {
  const db = getDb();
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM extra_completions WHERE id = ? AND user_id = ?").run(completionId, userId);
    db.prepare("UPDATE users SET points_total = MAX(0, points_total - ?) WHERE id = ?").run(pointsToDeduct, userId);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

export function deleteUser(userId: string): void {
  const db = getDb();
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM community_comments WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM community_posts WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM extra_completions WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM weekly_completions WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM journal_completions WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

export function resetUserPassword(userId: string, passwordHash: string): void {
  getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, userId);
}

// ── Resources ────────────────────────────────────────────────────────────────

export type ResourceCategory = "libro" | "video" | "podcast" | "substack";

export interface Resource {
  id: string;
  category: ResourceCategory;
  title: string;
  description: string;
  url: string;
  created_at: string;
}

export function getResources(): Resource[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM resources ORDER BY created_at DESC")
    .all() as unknown as Resource[];
  return rows.map((r) => ({ ...r }));
}

export function createResource(
  category: ResourceCategory,
  title: string,
  description: string,
  url: string,
): Resource {
  const db = getDb();
  const id = randomUUID();
  db.prepare(
    "INSERT INTO resources (id, category, title, description, url) VALUES (?, ?, ?, ?, ?)"
  ).run(id, category, title, description, url);
  return db.prepare("SELECT * FROM resources WHERE id = ?").get(id) as unknown as Resource;
}

export function deleteResource(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM resources WHERE id = ?").run(id);
}

// ── Community ─────────────────────────────────────────────────────────────────

export interface CommunityPost {
  id: string;
  user_id: string;
  user_name: string;
  week_number: number;
  post_type: "reto" | "libre";
  content: string;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface CommunityPostWithComments extends CommunityPost {
  comments: CommunityComment[];
}

export function getCommunityPosts(): CommunityPostWithComments[] {
  const db = getDb();
  const posts = db
    .prepare("SELECT * FROM community_posts ORDER BY created_at DESC LIMIT 100")
    .all() as unknown as CommunityPost[];
  const comments = db
    .prepare("SELECT * FROM community_comments ORDER BY created_at ASC")
    .all() as unknown as CommunityComment[];

  const byPost: Record<string, CommunityComment[]> = {};
  for (const c of comments) {
    (byPost[c.post_id] ??= []).push(c);
  }
  return posts.map((p) => ({
    ...p,
    post_type: (p.post_type ?? "reto") as "reto" | "libre",
    comments: (byPost[p.id] ?? []).map((c) => ({ ...c })),
  }));
}

export function createCommunityPost(
  userId: string,
  userName: string,
  weekNumber: number,
  content: string,
  fileName: string | null,
  fileType: string | null,
  postType: "reto" | "libre" = "reto",
): CommunityPost {
  const db = getDb();
  const id = randomUUID();
  db.prepare(
    `INSERT INTO community_posts (id, user_id, user_name, week_number, post_type, content, file_name, file_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, userId, userName, weekNumber, postType, content, fileName, fileType);
  return db.prepare("SELECT * FROM community_posts WHERE id = ?").get(id) as unknown as CommunityPost;
}

export function updateCommunityPost(postId: string, userId: string, content: string): boolean {
  const db = getDb();
  const result = db.prepare(
    "UPDATE community_posts SET content = ? WHERE id = ? AND user_id = ?"
  ).run(content, postId, userId);
  return (result.changes as number) > 0;
}

export function deleteCommunityPost(postId: string): void {
  const db = getDb();
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM community_comments WHERE post_id = ?").run(postId);
    db.prepare("DELETE FROM community_posts WHERE id = ?").run(postId);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

// ── Brand-Stein conversations ─────────────────────────────────────────────────

export interface BrandSteinMessage {
  role: "user" | "assistant";
  content: string;
}

export function getBrandSteinConversation(userId: string): BrandSteinMessage[] {
  const db = getDb();
  const row = db.prepare("SELECT messages_json FROM brandstein_conversations WHERE user_id = ?").get(userId) as { messages_json: string } | undefined;
  if (!row) return [];
  try {
    return JSON.parse(row.messages_json) as BrandSteinMessage[];
  } catch {
    return [];
  }
}

export function saveBrandSteinConversation(userId: string, messages: BrandSteinMessage[]): void {
  const db = getDb();
  const messagesJson = JSON.stringify(messages);
  db.prepare(
    `INSERT INTO brandstein_conversations (id, user_id, messages_json, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET messages_json = excluded.messages_json, updated_at = datetime('now')`
  ).run(randomUUID(), userId, messagesJson);
}

export function clearBrandSteinConversation(userId: string): void {
  const db = getDb();
  db.prepare("DELETE FROM brandstein_conversations WHERE user_id = ?").run(userId);
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  post_id: string | null;
  read: number;
  created_at: string;
}

export function createNotification(userId: string, message: string, postId: string | null, type: string = "comment"): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO notifications (id, user_id, type, message, post_id) VALUES (?, ?, ?, ?, ?)"
  ).run(randomUUID(), userId, type, message, postId);
}

export function hasReminderToday(userId: string, type: string): boolean {
  const db = getDb();
  return !!db.prepare(
    "SELECT id FROM notifications WHERE user_id = ? AND type = ? AND DATE(created_at) = DATE('now')"
  ).get(userId, type);
}

export function createReminderIfNeeded(userId: string, type: string, message: string): void {
  if (hasReminderToday(userId, type)) return;
  createNotification(userId, message, null, type);
}

export function getUnreadNotifications(userId: string): Notification[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM notifications WHERE user_id = ? AND read = 0 ORDER BY created_at DESC LIMIT 30"
  ).all(userId) as unknown as Notification[];
  return rows.map((r) => ({ ...r }));
}

export function markAllNotificationsRead(userId: string): void {
  const db = getDb();
  db.prepare("UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0").run(userId);
}

export function getCommunityPostById(postId: string): CommunityPost | undefined {
  const db = getDb();
  const row = db.prepare("SELECT * FROM community_posts WHERE id = ?").get(postId) as unknown as CommunityPost | undefined;
  if (!row) return undefined;
  return { ...row };
}

export function deleteCommunityPostByOwner(postId: string, userId: string): boolean {
  const db = getDb();
  db.exec("BEGIN");
  try {
    const post = db.prepare("SELECT id FROM community_posts WHERE id = ? AND user_id = ?").get(postId, userId);
    if (!post) { db.exec("ROLLBACK"); return false; }
    db.prepare("DELETE FROM community_comments WHERE post_id = ?").run(postId);
    db.prepare("DELETE FROM community_posts WHERE id = ?").run(postId);
    db.exec("COMMIT");
    return true;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

export function updateCommunityComment(commentId: string, userId: string, content: string): boolean {
  const db = getDb();
  const result = db.prepare(
    "UPDATE community_comments SET content = ? WHERE id = ? AND user_id = ?"
  ).run(content, commentId, userId);
  return (result.changes as number) > 0;
}

export function deleteCommunityComment(commentId: string, userId: string): boolean {
  const db = getDb();
  const result = db.prepare(
    "DELETE FROM community_comments WHERE id = ? AND user_id = ?"
  ).run(commentId, userId);
  return (result.changes as number) > 0;
}

export function createCommunityComment(
  postId: string,
  userId: string,
  userName: string,
  content: string,
): CommunityComment {
  const db = getDb();
  const id = randomUUID();
  db.prepare(
    `INSERT INTO community_comments (id, post_id, user_id, user_name, content)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, postId, userId, userName, content);
  return db.prepare("SELECT * FROM community_comments WHERE id = ?").get(id) as unknown as CommunityComment;
}
