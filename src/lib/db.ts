import { DatabaseSync } from "node:sqlite";
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

export function createUser(user: Omit<User, "created_at" | "points_total">): User {
  const db = getDb();
  db.prepare(
    `INSERT INTO users (id, full_name, email, phone, social_handle, password_hash, contract_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    user.id,
    user.full_name,
    user.email,
    user.phone,
    user.social_handle,
    user.password_hash,
    user.contract_json
  );
  return getUserById(user.id)!;
}

export function getUserByEmail(email: string): User | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase().trim()) as User | undefined;
}

export function getUserById(id: string): User | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | User
    | undefined;
}
