import { eq } from 'drizzle-orm'
import { connection } from '../db/client.js'
import { users } from '../db/schema.js'

const publicColumns = {
  id: users.id,
  email: users.email,
  name: users.name,
  is_admin: users.is_admin,
}

export function findUserByEmail(email, tx) {
  return connection(tx)
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get()
}

export function findPublicUserById(id, tx) {
  return connection(tx)
    .select(publicColumns)
    .from(users)
    .where(eq(users.id, id))
    .get()
}

export function insertUser(values, tx) {
  const created = connection(tx)
    .insert(users)
    .values(values)
    .returning({ id: users.id })
    .get()

  return created.id
}
