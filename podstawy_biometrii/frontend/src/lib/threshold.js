export function zastosujProg(pikseleWSkaliSzarosci, poziomProgu) {
  const pikseleBinarne = new Uint8Array(pikseleWSkaliSzarosci.length)

  for (let indeksPiksela = 0; indeksPiksela < pikseleWSkaliSzarosci.length; indeksPiksela++) {
    const jasnoscPiksela = pikseleWSkaliSzarosci[indeksPiksela]
    pikseleBinarne[indeksPiksela] = jasnoscPiksela >= poziomProgu ? 255 : 0
  }

  return pikseleBinarne
}
