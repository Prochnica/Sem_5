let pamiecObrazuCalkowego = null

function zbudujObrazyCalkowe(pikseleWSkaliSzarosci, szerokoscObrazu, wysokoscObrazu) {
  if (
    pamiecObrazuCalkowego
    && pamiecObrazuCalkowego.pikseleWSkaliSzarosci === pikseleWSkaliSzarosci
    && pamiecObrazuCalkowego.szerokoscObrazu === szerokoscObrazu
    && pamiecObrazuCalkowego.wysokoscObrazu === wysokoscObrazu
  ) {
    return pamiecObrazuCalkowego
  }

  // Dodatkowy wiersz i kolumna zer, żeby suma okna nie wychodziła poza tablicę.
  const dlugoscWierszaObrazuCalkowego = szerokoscObrazu + 1
  const calkaJasnosci = new Float64Array(dlugoscWierszaObrazuCalkowego * (wysokoscObrazu + 1))
  const calkaKwadratuJasnosci = new Float64Array(dlugoscWierszaObrazuCalkowego * (wysokoscObrazu + 1))

  for (let wierszPiksela = 1; wierszPiksela <= wysokoscObrazu; wierszPiksela++) {
    let sumaJasnosciWiersza = 0
    let sumaKwadratuJasnosciWiersza = 0
    const indeksPoczatkuWiersza = (wierszPiksela - 1) * szerokoscObrazu

    for (let kolumnaPiksela = 1; kolumnaPiksela <= szerokoscObrazu; kolumnaPiksela++) {
      const jasnoscPiksela = pikseleWSkaliSzarosci[indeksPoczatkuWiersza + kolumnaPiksela - 1]
      sumaJasnosciWiersza += jasnoscPiksela
      sumaKwadratuJasnosciWiersza += jasnoscPiksela * jasnoscPiksela
      const indeksCalki = wierszPiksela * dlugoscWierszaObrazuCalkowego + kolumnaPiksela
      calkaJasnosci[indeksCalki] = calkaJasnosci[indeksCalki - dlugoscWierszaObrazuCalkowego] + sumaJasnosciWiersza
      calkaKwadratuJasnosci[indeksCalki] = calkaKwadratuJasnosci[indeksCalki - dlugoscWierszaObrazuCalkowego] + sumaKwadratuJasnosciWiersza
    }
  }

  pamiecObrazuCalkowego = {
    pikseleWSkaliSzarosci,
    szerokoscObrazu,
    wysokoscObrazu,
    calkaJasnosci,
    calkaKwadratuJasnosci,
    dlugoscWierszaObrazuCalkowego,
  }
  return pamiecObrazuCalkowego
}

function sumaWewnatrzOkna(tablicaCalki, dlugoscWierszaObrazuCalkowego, lewaKrawedzOkna, gornaKrawedzOkna, prawaKrawedzOkna, dolnaKrawedzOkna) {
  const indeksPrawegoDolnego = (dolnaKrawedzOkna + 1) * dlugoscWierszaObrazuCalkowego + (prawaKrawedzOkna + 1)
  const indeksLewegoDolnego = (dolnaKrawedzOkna + 1) * dlugoscWierszaObrazuCalkowego + lewaKrawedzOkna
  const indeksPrawegoGornego = gornaKrawedzOkna * dlugoscWierszaObrazuCalkowego + (prawaKrawedzOkna + 1)
  const indeksLewegoGornego = gornaKrawedzOkna * dlugoscWierszaObrazuCalkowego + lewaKrawedzOkna
  return tablicaCalki[indeksPrawegoDolnego] - tablicaCalki[indeksLewegoDolnego] - tablicaCalki[indeksPrawegoGornego] + tablicaCalki[indeksLewegoGornego]
}

export function zastosujProgNiblacka(pikseleWSkaliSzarosci, szerokoscObrazu, wysokoscObrazu, rozmiarOkna, wspolczynnikNiblacka) {
  const { calkaJasnosci, calkaKwadratuJasnosci, dlugoscWierszaObrazuCalkowego } = zbudujObrazyCalkowe(
    pikseleWSkaliSzarosci,
    szerokoscObrazu,
    wysokoscObrazu,
  )
  const promienOkna = Math.floor(rozmiarOkna / 2)
  const pikseleBinarne = new Uint8Array(pikseleWSkaliSzarosci.length)

  for (let wierszPiksela = 0; wierszPiksela < wysokoscObrazu; wierszPiksela++) {
    const gornaKrawedzOkna = Math.max(0, wierszPiksela - promienOkna)
    const dolnaKrawedzOkna = Math.min(wysokoscObrazu - 1, wierszPiksela + promienOkna)

    for (let kolumnaPiksela = 0; kolumnaPiksela < szerokoscObrazu; kolumnaPiksela++) {
      const lewaKrawedzOkna = Math.max(0, kolumnaPiksela - promienOkna)
      const prawaKrawedzOkna = Math.min(szerokoscObrazu - 1, kolumnaPiksela + promienOkna)
      const liczbaPikseliWOknie = (prawaKrawedzOkna - lewaKrawedzOkna + 1) * (dolnaKrawedzOkna - gornaKrawedzOkna + 1)
      const sredniaJasnoscWOknie = sumaWewnatrzOkna(
        calkaJasnosci,
        dlugoscWierszaObrazuCalkowego,
        lewaKrawedzOkna,
        gornaKrawedzOkna,
        prawaKrawedzOkna,
        dolnaKrawedzOkna,
      ) / liczbaPikseliWOknie
      const sredniaKwadratuJasnosciWOknie = sumaWewnatrzOkna(
        calkaKwadratuJasnosci,
        dlugoscWierszaObrazuCalkowego,
        lewaKrawedzOkna,
        gornaKrawedzOkna,
        prawaKrawedzOkna,
        dolnaKrawedzOkna,
      ) / liczbaPikseliWOknie
      const wariancjaWOknie = sredniaKwadratuJasnosciWOknie - sredniaJasnoscWOknie * sredniaJasnoscWOknie
      const odchylenieStandardoweWOknie = Math.sqrt(wariancjaWOknie > 0 ? wariancjaWOknie : 0)
      const progLokalny = sredniaJasnoscWOknie + wspolczynnikNiblacka * odchylenieStandardoweWOknie
      const indeksPiksela = wierszPiksela * szerokoscObrazu + kolumnaPiksela
      const jasnoscPiksela = pikseleWSkaliSzarosci[indeksPiksela]
      pikseleBinarne[indeksPiksela] = jasnoscPiksela >= progLokalny ? 255 : 0
    }
  }

  return pikseleBinarne
}
