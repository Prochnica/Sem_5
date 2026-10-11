export function applyThreshold(gray, level) {
  const out = new Uint8Array(gray.length)

  for (let i = 0; i < gray.length; i++) {
    out[i] = gray[i] >= level ? 255 : 0
  }

  return out
}
