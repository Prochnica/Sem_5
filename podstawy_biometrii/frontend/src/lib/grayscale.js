export function toGrayscale(imageData) {
  const { data } = imageData
  const gray = new Uint8Array(data.length / 4)

  for (let i = 0, pixel = 0; i < data.length; i += 4, pixel++) {
    const value = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    gray[pixel] = Math.min(255, Math.max(0, value))
  }

  return gray
}
