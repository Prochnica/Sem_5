export function notImplemented(req, res) {
  res.status(501).json({ error: 'not_implemented' })
}
