export class ApiError extends Error {
  constructor(status, error, message) {
    super(message)
    this.status = status
    this.error = error
  }
}

export function handle(routeHandler) {
  return (request, response, nextMiddleware) => {
    try {
      routeHandler(request, response, nextMiddleware)
    } catch (error) {
      nextMiddleware(error)
    }
  }
}

export function sendError(caughtError, request, response, nextMiddleware) {
  if (response.headersSent) {
    nextMiddleware(caughtError)
    return
  }

  if (caughtError instanceof ApiError) {
    response.status(caughtError.status).json({ error: caughtError.error, message: caughtError.message })
    return
  }

  if (caughtError instanceof SyntaxError && caughtError.status === 400) {
    response.status(400).json({ error: 'validation', message: 'Niepoprawny JSON' })
    return
  }

  console.error(caughtError)
  response.status(500).json({ error: 'server_error', message: 'Błąd serwera' })
}
