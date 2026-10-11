export function paintMask(canvas, binary, width, height) {
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  const image = context.createImageData(width, height)
  const data = image.data

  for (let i = 0, pixel = 0; i < binary.length; i++, pixel += 4) {
    const value = binary[i]
    data[pixel] = value
    data[pixel + 1] = value
    data[pixel + 2] = value
    data[pixel + 3] = 255
  }

  context.putImageData(image, 0, 0)
}

export function drawHistogram(canvas, bins, mark) {
  const cssWidth = canvas.clientWidth
  const cssHeight = canvas.clientHeight || 160
  if (cssWidth === 0) return false

  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.round(cssWidth * dpr)
  canvas.height = Math.round(cssHeight * dpr)

  const context = canvas.getContext('2d')
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, cssWidth, cssHeight)

  let max = 0
  for (let level = 0; level < 256; level++) {
    if (bins[level] > max) max = bins[level]
  }
  if (max === 0) max = 1

  const barWidth = cssWidth / 256
  context.fillStyle = '#444444'
  for (let level = 0; level < 256; level++) {
    const barHeight = (bins[level] / max) * (cssHeight - 8)
    context.fillRect(level * barWidth, cssHeight - barHeight, barWidth + 0.5, barHeight)
  }

  if (mark !== null && mark !== undefined) {
    const x = (Number(mark) + 0.5) * barWidth
    context.strokeStyle = '#cc0000'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, cssHeight)
    context.stroke()
  }

  return true
}
