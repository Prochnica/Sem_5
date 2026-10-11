let cache = null

function integralsFor(gray, width, height) {
  if (cache && cache.gray === gray && cache.width === width && cache.height === height) {
    return cache
  }

  const stride = width + 1
  const sum = new Float64Array(stride * (height + 1))
  const sumSq = new Float64Array(stride * (height + 1))

  for (let y = 1; y <= height; y++) {
    let rowSum = 0
    let rowSumSq = 0
    const grayOffset = (y - 1) * width

    for (let x = 1; x <= width; x++) {
      const value = gray[grayOffset + x - 1]
      rowSum += value
      rowSumSq += value * value
      const index = y * stride + x
      sum[index] = sum[index - stride] + rowSum
      sumSq[index] = sumSq[index - stride] + rowSumSq
    }
  }

  cache = { gray, width, height, sum, sumSq, stride }
  return cache
}

function windowSum(table, stride, x0, y0, x1, y1) {
  const bottomRight = (y1 + 1) * stride + (x1 + 1)
  const bottomLeft = (y1 + 1) * stride + x0
  const topRight = y0 * stride + (x1 + 1)
  const topLeft = y0 * stride + x0
  return table[bottomRight] - table[bottomLeft] - table[topRight] + table[topLeft]
}

export function niblack(gray, width, height, windowSize, k) {
  const { sum, sumSq, stride } = integralsFor(gray, width, height)
  const radius = Math.floor(windowSize / 2)
  const out = new Uint8Array(gray.length)

  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - radius)
    const y1 = Math.min(height - 1, y + radius)

    for (let x = 0; x < width; x++) {
      const x0 = Math.max(0, x - radius)
      const x1 = Math.min(width - 1, x + radius)
      const area = (x1 - x0 + 1) * (y1 - y0 + 1)
      const mean = windowSum(sum, stride, x0, y0, x1, y1) / area
      const meanSquare = windowSum(sumSq, stride, x0, y0, x1, y1) / area
      const variance = meanSquare - mean * mean
      const deviation = Math.sqrt(variance > 0 ? variance : 0)
      const localThreshold = mean + k * deviation
      const index = y * width + x
      out[index] = gray[index] >= localThreshold ? 255 : 0
    }
  }

  return out
}
