import { checkPassword, hashPassword, signToken } from '../auth.js'
import { ApiError } from '../errors.js'
import { findPublicUserById, findUserByEmail, insertUser } from '../repositories/userRepository.js'

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    is_admin: user.is_admin,
  }
}

export function registerUser({ email, password, name }) {
  if (findUserByEmail(email)) {
    throw new ApiError(409, 'conflict', 'Ten email jest już zajęty')
  }

  const id = insertUser({
    email,
    password_hash: hashPassword(password),
    name,
    is_admin: 0,
    created_at: new Date().toISOString(),
  })

  return {
    token: signToken(id),
    user: publicUser(findPublicUserById(id)),
  }
}

export function loginUser({ email, password }) {
  const user = findUserByEmail(email)

  if (!user || !checkPassword(password, user.password_hash)) {
    throw new ApiError(401, 'unauthorized', 'Zły email albo hasło')
  }

  return {
    token: signToken(user.id),
    user: publicUser(user),
  }
}
