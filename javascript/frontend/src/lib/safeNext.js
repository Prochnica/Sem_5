export function safeNext(value) {
  if (typeof value !== 'string') {
    return '/'
  }
  if (!value.startsWith('/') || value.startsWith('//')) {
    return '/'
  }
  return value
}
