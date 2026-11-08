import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, readToken, saveToken } from '../lib/api.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  async function loadCurrentUser() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('emarket-session')
    }
    if (!readToken()) {
      user.value = null
      return
    }
    try {
      user.value = await api('/api/auth/me')
    } catch {
      saveToken(null)
      user.value = null
    }
  }

  async function login(email, password) {
    const payload = await api('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    saveToken(payload.token)
    user.value = payload.user
  }

  async function register({ name, email, password }) {
    const payload = await api('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    })
    saveToken(payload.token)
    user.value = payload.user
  }

  function logout() {
    saveToken(null)
    user.value = null
    api('/api/auth/logout', { method: 'POST' }).catch(() => {})
  }

  return { user, loadCurrentUser, login, register, logout }
})
