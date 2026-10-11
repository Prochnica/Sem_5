import { reactive, watch } from 'vue'

// Makieta sesji na 18.10. Docelowe logowanie idzie przez API.
const builtInAccounts = [
  {
    email: 'klient@emarket.test',
    password: 'klient123',
    name: 'Klient testowy',
    isAdmin: false,
  },
  {
    email: 'admin@emarket.test',
    password: 'admin123',
    name: 'Admin testowy',
    isAdmin: true,
  },
]

const storageKey = 'emarket-session'

function readState() {
  if (typeof sessionStorage === 'undefined') {
    return { user: null, registered: [] }
  }
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) {
      return { user: null, registered: [] }
    }
    const parsed = JSON.parse(raw)
    return {
      user: parsed.user ?? null,
      registered: Array.isArray(parsed.registered) ? parsed.registered : [],
    }
  } catch {
    return { user: null, registered: [] }
  }
}

const stored = readState()

export const session = reactive({
  user: stored.user,
  registered: stored.registered,
})

watch(
  session,
  () => {
    if (typeof sessionStorage === 'undefined') {
      return
    }
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        user: session.user,
        registered: session.registered,
      }),
    )
  },
  { deep: true },
)

function findAccount(email) {
  const needle = email.trim().toLowerCase()
  return (
    builtInAccounts.find((account) => account.email === needle) ??
    session.registered.find((account) => account.email === needle) ??
    null
  )
}

export function loginWithPassword(email, password) {
  const account = findAccount(email)
  if (!account || account.password !== password) {
    return { ok: false, message: 'Nie ma takiego konta albo hasło się nie zgadza.' }
  }

  session.user = {
    email: account.email,
    name: account.name,
    isAdmin: account.isAdmin,
  }
  return { ok: true }
}

export function registerAccount({ name, email, password }) {
  const normalized = email.trim().toLowerCase()
  if (findAccount(normalized)) {
    return { ok: false, message: 'To konto już istnieje.' }
  }

  const account = {
    email: normalized,
    password,
    name: name.trim(),
    isAdmin: false,
  }
  session.registered.push(account)
  session.user = {
    email: account.email,
    name: account.name,
    isAdmin: false,
  }
  return { ok: true }
}

export function logout() {
  session.user = null
}
