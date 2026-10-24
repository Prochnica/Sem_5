export function zbudujHistogramJasnosci(pikseleWSkaliSzarosci) {
  const histogramJasnosci = new Uint32Array(256)

  for (let indeksPiksela = 0; indeksPiksela < pikseleWSkaliSzarosci.length; indeksPiksela++) {
    const jasnoscPiksela = pikseleWSkaliSzarosci[indeksPiksela]
    histogramJasnosci[jasnoscPiksela]++
  }

  return histogramJasnosci
}
