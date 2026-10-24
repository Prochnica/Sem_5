import { zbudujHistogramJasnosci } from './histogram.js'

export function progOtsu(pikseleWSkaliSzarosci) {
  const histogramJasnosci = zbudujHistogramJasnosci(pikseleWSkaliSzarosci)
  const liczbaPikseli = pikseleWSkaliSzarosci.length
  if (liczbaPikseli === 0) return 0

  let sumaJasnosciWszystkich = 0
  for (let kandydatNaProg = 0; kandydatNaProg < 256; kandydatNaProg++) {
    const liczbaPikseliOTejJasnosci = histogramJasnosci[kandydatNaProg]
    sumaJasnosciWszystkich += kandydatNaProg * liczbaPikseliOTejJasnosci
  }

  let sumaJasnosciTla = 0
  let liczbaPikseliTla = 0
  let najlepszaWariancjaMiedzyklasowa = -1
  let najlepszyProg = 0

  for (let kandydatNaProg = 0; kandydatNaProg < 256; kandydatNaProg++) {
    const liczbaPikseliOTejJasnosci = histogramJasnosci[kandydatNaProg]
    liczbaPikseliTla += liczbaPikseliOTejJasnosci
    if (liczbaPikseliTla === 0) continue

    const liczbaPikseliPierwszegoPlanu = liczbaPikseli - liczbaPikseliTla
    if (liczbaPikseliPierwszegoPlanu === 0) break

    sumaJasnosciTla += kandydatNaProg * liczbaPikseliOTejJasnosci
    const sredniaJasnoscTla = sumaJasnosciTla / liczbaPikseliTla
    const sredniaJasnoscPierwszegoPlanu = (sumaJasnosciWszystkich - sumaJasnosciTla) / liczbaPikseliPierwszegoPlanu
    const roznicaSrednichJasnosci = sredniaJasnoscTla - sredniaJasnoscPierwszegoPlanu
    const wariancjaMiedzyklasowa = liczbaPikseliTla * liczbaPikseliPierwszegoPlanu * roznicaSrednichJasnosci * roznicaSrednichJasnosci

    // Remis (puste kubełki między dwiema grupami) rozstrzygamy wyższym progiem,
    // żeby reguła "jasność >= próg" nadal oddzielała ciemne piksele od jasnych.
    if (wariancjaMiedzyklasowa >= najlepszaWariancjaMiedzyklasowa) {
      najlepszaWariancjaMiedzyklasowa = wariancjaMiedzyklasowa
      najlepszyProg = kandydatNaProg
    }
  }

  return najlepszyProg
}
