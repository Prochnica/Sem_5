export async function callApi(path, options = {}) {
  try {
    const response = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
    const body = await response.json().catch(() => ({}))

    if (response.status === 501) {
      return {
        ok: false,
        message: 'Endpoint jest w szkielecie i jeszcze nic nie zapisuje.',
      }
    }

    if (!response.ok) {
      return { ok: false, message: 'Nie udało się wywołać API.' }
    }

    return { ok: true, body }
  } catch {
    return { ok: false, message: 'Brak połączenia z API.' }
  }
}
