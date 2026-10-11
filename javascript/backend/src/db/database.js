import { DatabaseSync } from 'node:sqlite'

export function openDatabase(filePath) {
  const database = new DatabaseSync(filePath)
  database.exec('PRAGMA foreign_keys = ON')
  return database
}
