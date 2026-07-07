import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "app.db");

declare global {
  var __db: DatabaseSync | undefined;
}

function getDb(): DatabaseSync {
  if (!global.__db) {
    const db = new DatabaseSync(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        social_handle TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        contract_json TEXT NOT NULL,
        points_total INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS journal_completions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        completed_date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, completed_date)
      );

      CREATE TABLE IF NOT EXISTS weekly_completions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        week_number INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, week_number)
      );

      CREATE TABLE IF NOT EXISTS extra_completions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        challenge_id TEXT NOT NULL,
        evidence_filename TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, challenge_id)
      );
    `);
    global.__db = db;
  }
  return global.__db;
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
  return db.prepare("SELECT * FROM users ORDER BY points_total DESC").all() as unknown as User[];
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

export function hasExtraCompletion(userId: string, challengeId: string): boolean {
  const db = getDb();
  return !!db.prepare("SELECT id FROM extra_completions WHERE user_id = ? AND challenge_id = ?").get(userId, challengeId);
}

export function getExtraCompletionsForUser(userId: string): ExtraCompletion[] {
  const db = getDb();
  return db.prepare("SELECT * FROM extra_completions WHERE user_id = ?").all(userId) as unknown as ExtraCompletion[];
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
