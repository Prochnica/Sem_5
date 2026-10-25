const tokenKey = 'emarket-token'

export function readToken() {
  if (typeof localStorage === 'undefined') {
    return null
  }
  return localStorage.getItem(tokenKey)
}

export function saveToken(token) {
  if (typeof localStorage === 'undefined') {
    return
  }
  if (token) {
    localStorage.setItem(tokenKey, token)
    return
  }
  localStorage.removeItem(tokenKey)
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  const token = readToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('Nie udało się połączyć z serwerem.')
  }

  if (response.status === 204) {
    return null
  }

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.message || 'Nie udało się wykonać operacji.')
  }
  return payload
}
