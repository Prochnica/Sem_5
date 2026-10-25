import { reactive } from 'vue'
import { api, readToken, saveToken } from '../lib/api.js'

export const auth = reactive({
  user: null,
})

export async function loadCurrentUser() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('emarket-session')
  }
  if (!readToken()) {
    auth.user = null
    return
  }
  try {
    auth.user = await api('/api/auth/me')
  } catch {
    saveToken(null)
    auth.user = null
  }
}

export async function login(email, password) {
  const payload = await api('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  saveToken(payload.token)
  auth.user = payload.user
}

export async function register({ name, email, password }) {
  const payload = await api('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  })
  saveToken(payload.token)
  auth.user = payload.user
}

export function logout() {
  saveToken(null)
  auth.user = null
  api('/api/auth/logout', { method: 'POST' }).catch(() => {})
}
