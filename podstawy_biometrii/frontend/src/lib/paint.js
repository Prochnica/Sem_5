export function namalujObrazBinarny(plotno, pikseleBinarne, szerokoscObrazu, wysokoscObrazu) {
  plotno.width = szerokoscObrazu
  plotno.height = wysokoscObrazu
  const kontekstRysowania = plotno.getContext('2d')
  const daneWynikowegoObrazu = kontekstRysowania.createImageData(szerokoscObrazu, wysokoscObrazu)
  const bajtyPikseli = daneWynikowegoObrazu.data

  for (let indeksPiksela = 0, indeksBajtu = 0; indeksPiksela < pikseleBinarne.length; indeksPiksela++, indeksBajtu += 4) {
    const wartoscBinarna = pikseleBinarne[indeksPiksela]
    bajtyPikseli[indeksBajtu] = wartoscBinarna
    bajtyPikseli[indeksBajtu + 1] = wartoscBinarna
    bajtyPikseli[indeksBajtu + 2] = wartoscBinarna
    bajtyPikseli[indeksBajtu + 3] = 255
  }

  kontekstRysowania.putImageData(daneWynikowegoObrazu, 0, 0)
}

export function narysujHistogramJasnosci(plotno, histogramJasnosci, poziomProgu) {
  const szerokoscPlotnaWCss = plotno.clientWidth
  const wysokoscPlotnaWCss = plotno.clientHeight || 160
  if (szerokoscPlotnaWCss === 0) return false

  const gestoscPikseliEkranu = window.devicePixelRatio || 1
  plotno.width = Math.round(szerokoscPlotnaWCss * gestoscPikseliEkranu)
  plotno.height = Math.round(wysokoscPlotnaWCss * gestoscPikseliEkranu)

  const kontekstRysowania = plotno.getContext('2d')
  kontekstRysowania.setTransform(gestoscPikseliEkranu, 0, 0, gestoscPikseliEkranu, 0, 0)
  kontekstRysowania.fillStyle = '#ffffff'
  kontekstRysowania.fillRect(0, 0, szerokoscPlotnaWCss, wysokoscPlotnaWCss)

  let najwyzszaLiczbaWKubelku = 0
  for (let poziomJasnosci = 0; poziomJasnosci < 256; poziomJasnosci++) {
    const liczbaPikseliOTejJasnosci = histogramJasnosci[poziomJasnosci]
    if (liczbaPikseliOTejJasnosci > najwyzszaLiczbaWKubelku) najwyzszaLiczbaWKubelku = liczbaPikseliOTejJasnosci
  }
  if (najwyzszaLiczbaWKubelku === 0) najwyzszaLiczbaWKubelku = 1

  const szerokoscSlupkaHistogramu = szerokoscPlotnaWCss / 256
  kontekstRysowania.fillStyle = '#444444'
  for (let poziomJasnosci = 0; poziomJasnosci < 256; poziomJasnosci++) {
    const liczbaPikseliOTejJasnosci = histogramJasnosci[poziomJasnosci]
    const wysokoscSlupkaHistogramu = (liczbaPikseliOTejJasnosci / najwyzszaLiczbaWKubelku) * (wysokoscPlotnaWCss - 8)
    kontekstRysowania.fillRect(
      poziomJasnosci * szerokoscSlupkaHistogramu,
      wysokoscPlotnaWCss - wysokoscSlupkaHistogramu,
      szerokoscSlupkaHistogramu + 0.5,
      wysokoscSlupkaHistogramu,
    )
  }

  if (poziomProgu !== null && poziomProgu !== undefined) {
    const pozycjaKreskiProgu = (Number(poziomProgu) + 0.5) * szerokoscSlupkaHistogramu
    kontekstRysowania.strokeStyle = '#cc0000'
    kontekstRysowania.lineWidth = 2
    kontekstRysowania.beginPath()
    kontekstRysowania.moveTo(pozycjaKreskiProgu, 0)
    kontekstRysowania.lineTo(pozycjaKreskiProgu, wysokoscPlotnaWCss)
    kontekstRysowania.stroke()
  }

  return true
}
