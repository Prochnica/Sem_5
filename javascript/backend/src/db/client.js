import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { drizzle } from 'drizzle-orm/node-sqlite'
import { migrate } from 'drizzle-orm/node-sqlite/migrator'
import { seedIfEmpty } from './seed.js'

const migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'drizzle')

let database

export function getDatabase() {
  if (!database) {
    throw new Error('Baza nie działa')
  }

  return database
}

export function connection(tx) {
  return tx ?? getDatabase()
}

export function initDatabase(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const sqlite = new DatabaseSync(filePath)
  // Generated SQL creates child tables before parents. SQLite accepts those
  // foreign keys only while the pragma is off.
  sqlite.exec('PRAGMA foreign_keys = OFF')
  database = drizzle({ client: sqlite })
  migrate(database, { migrationsFolder })
  sqlite.exec('PRAGMA foreign_keys = ON')
  seedIfEmpty(database)
  return database
}
