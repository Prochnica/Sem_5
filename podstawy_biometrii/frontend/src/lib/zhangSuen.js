function przejsciaZZeraDoJedynki(p2, p3, p4, p5, p6, p7, p8, p9) {
  const sasiedzi = [p2, p3, p4, p5, p6, p7, p8, p9, p2]
  let liczbaPrzejsc = 0
  for (let indeksSasiada = 0; indeksSasiada < 8; indeksSasiada++) {
    if (sasiedzi[indeksSasiada] === 0 && sasiedzi[indeksSasiada + 1] === 1) {
      liczbaPrzejsc += 1
    }
  }
  return liczbaPrzejsc
}

function politeracja(obraz, szerokoscObrazu, wysokoscObrazu, pierwszaPoliteracja) {
  const doSkasowania = []

  for (let wiersz = 1; wiersz < wysokoscObrazu - 1; wiersz++) {
    const poczatekWiersza = wiersz * szerokoscObrazu
    for (let kolumna = 1; kolumna < szerokoscObrazu - 1; kolumna++) {
      const indeks = poczatekWiersza + kolumna
      if (obraz[indeks] !== 1) continue

      const p2 = obraz[indeks - szerokoscObrazu]
      const p3 = obraz[indeks - szerokoscObrazu + 1]
      const p4 = obraz[indeks + 1]
      const p5 = obraz[indeks + szerokoscObrazu + 1]
      const p6 = obraz[indeks + szerokoscObrazu]
      const p7 = obraz[indeks + szerokoscObrazu - 1]
      const p8 = obraz[indeks - 1]
      const p9 = obraz[indeks - szerokoscObrazu - 1]
      const liczbaSasiadow = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9
      if (liczbaSasiadow < 2 || liczbaSasiadow > 6) continue
      if (przejsciaZZeraDoJedynki(p2, p3, p4, p5, p6, p7, p8, p9) !== 1) continue

      if (pierwszaPoliteracja) {
        if (p2 * p4 * p6 !== 0) continue
        if (p4 * p6 * p8 !== 0) continue
      }
      else if (p2 * p4 * p8 !== 0 || p2 * p6 * p8 !== 0) {
        continue
      }

      doSkasowania.push(indeks)
    }
  }

  for (let indeksSkasowania = 0; indeksSkasowania < doSkasowania.length; indeksSkasowania++) {
    obraz[doSkasowania[indeksSkasowania]] = 0
  }
  return doSkasowania.length > 0
}

function kopiaDoWyswietlenia(obraz) {
  const klatka = new Uint8Array(obraz.length)
  for (let indeks = 0; indeks < obraz.length; indeks++) {
    klatka[indeks] = obraz[indeks] ? 255 : 0
  }
  return klatka
}

export function przygotujObiekt(pikseleBinarne, obiektCiemny) {
  const obiekt = new Uint8Array(pikseleBinarne.length)
  for (let indeks = 0; indeks < pikseleBinarne.length; indeks++) {
    const pikselJasny = pikseleBinarne[indeks] === 255
    obiekt[indeks] = pikselJasny === obiektCiemny ? 0 : 255
  }
  return obiekt
}

export function scienianieZhangSuen(pikseleObiektu, szerokoscObrazu, wysokoscObrazu, maksymalnaLiczbaIteracji) {
  const obraz = new Uint8Array(pikseleObiektu.length)
  for (let indeks = 0; indeks < pikseleObiektu.length; indeks++) {
    obraz[indeks] = pikseleObiektu[indeks] ? 1 : 0
  }

  const klatki = [kopiaDoWyswietlenia(obraz)]
  const poczatek = performance.now()
  let liczbaIteracji = 0
  let doszloDoKonca = false

  for (let numerIteracji = 0; numerIteracji < maksymalnaLiczbaIteracji; numerIteracji++) {
    const skasowanoWPierwszej = politeracja(obraz, szerokoscObrazu, wysokoscObrazu, true)
    const skasowanoWDrugiej = politeracja(obraz, szerokoscObrazu, wysokoscObrazu, false)
    if (!skasowanoWPierwszej && !skasowanoWDrugiej) {
      doszloDoKonca = true
      break
    }
    liczbaIteracji += 1
    klatki.push(kopiaDoWyswietlenia(obraz))
  }

  return {
    klatki,
    liczbaIteracji,
    doszloDoKonca,
    czasMs: performance.now() - poczatek,
  }
}

export function policzRoznicePikseli(naszePiksele, pikseleBiblioteki) {
  let liczbaRoznic = 0
  for (let indeks = 0; indeks < naszePiksele.length; indeks++) {
    const naszObiekt = naszePiksele[indeks] ? 1 : 0
    const obiektBiblioteki = pikseleBiblioteki[indeks] ? 1 : 0
    if (naszObiekt !== obiektBiblioteki) liczbaRoznic += 1
  }
  return liczbaRoznic
}

export function bityObiektu(pikseleObiektu) {
  const bity = new Uint8Array(pikseleObiektu.length)
  for (let indeks = 0; indeks < pikseleObiektu.length; indeks++) {
    bity[indeks] = pikseleObiektu[indeks] ? 1 : 0
  }
  return bity
}
