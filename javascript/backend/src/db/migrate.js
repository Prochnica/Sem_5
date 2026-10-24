import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations')

export function runMigrations(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY
    )
  `)

  const done = new Set(
    database.prepare('SELECT name FROM schema_migrations').all().map((row) => row.name),
  )
  const files = fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort()

  for (const name of files) {
    if (done.has(name)) {
      continue
    }

    database.exec(fs.readFileSync(path.join(migrationsDir, name), 'utf8'))
    database.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(name)
  }
}
