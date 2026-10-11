import { histogram } from './histogram.js'

export function otsuThreshold(gray) {
  const bins = histogram(gray)
  const total = gray.length
  if (total === 0) return 0

  let sumAll = 0
  for (let level = 0; level < 256; level++) {
    sumAll += level * bins[level]
  }

  let sumBackground = 0
  let weightBackground = 0
  let bestVariance = -1
  let bestLevel = 0

  for (let level = 0; level < 256; level++) {
    weightBackground += bins[level]
    if (weightBackground === 0) continue

    const weightForeground = total - weightBackground
    if (weightForeground === 0) break

    sumBackground += level * bins[level]
    const meanBackground = sumBackground / weightBackground
    const meanForeground = (sumAll - sumBackground) / weightForeground
    const difference = meanBackground - meanForeground
    const variance = weightBackground * weightForeground * difference * difference

    // Remis (puste kubełki między dwiema grupami) rozstrzygamy wyższym progiem,
    // żeby reguła "jasność >= próg" nadal oddzielała ciemne piksele od jasnych.
    if (variance >= bestVariance) {
      bestVariance = variance
      bestLevel = level
    }
  }

  return bestLevel
}
