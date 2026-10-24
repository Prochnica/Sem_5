export function safeRedirectPath(redirectPath) {
  if (typeof redirectPath !== 'string') {
    return '/'
  }
  if (!redirectPath.startsWith('/') || redirectPath.startsWith('//')) {
    return '/'
  }
  return redirectPath
}
