export function histogram(gray) {
  const bins = new Uint32Array(256)

  for (let i = 0; i < gray.length; i++) {
    bins[gray[i]]++
  }

  return bins
}
