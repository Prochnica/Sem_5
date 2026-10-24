import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { runMigrations } from './migrate.js'
import { seedIfEmpty } from './seed.js'

let database

export function getDatabase() {
  if (!database) {
    throw new Error('Baza nie działa')
  }

  return database
}

export function initDatabase(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  database = new DatabaseSync(filePath)
  database.exec('PRAGMA foreign_keys = ON')
  runMigrations(database)
  seedIfEmpty(database)
  return database
}

export function runInTransaction(fn) {
  const current = getDatabase()
  current.exec('BEGIN IMMEDIATE')

  try {
    const result = fn()
    current.exec('COMMIT')
    return result
  } catch (error) {
    current.exec('ROLLBACK')
    throw error
  }
}
