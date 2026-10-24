const wagaKanaluCzerwonego = 0.299
const wagaKanaluZielonego = 0.587
const wagaKanaluNiebieskiego = 0.114

export function doSkaliSzarosci(daneObrazu) {
  const bajtyPikseli = daneObrazu.data
  const pikseleWSkaliSzarosci = new Uint8Array(bajtyPikseli.length / 4)

  for (let indeksBajtu = 0, indeksPiksela = 0; indeksBajtu < bajtyPikseli.length; indeksBajtu += 4, indeksPiksela++) {
    const kanalCzerwony = bajtyPikseli[indeksBajtu]
    const kanalZielony = bajtyPikseli[indeksBajtu + 1]
    const kanalNiebieski = bajtyPikseli[indeksBajtu + 2]
    const jasnoscPiksela = Math.round(
      wagaKanaluCzerwonego * kanalCzerwony + wagaKanaluZielonego * kanalZielony + wagaKanaluNiebieskiego * kanalNiebieski,
    )
    pikseleWSkaliSzarosci[indeksPiksela] = Math.min(255, Math.max(0, jasnoscPiksela))
  }

  return pikseleWSkaliSzarosci
}
