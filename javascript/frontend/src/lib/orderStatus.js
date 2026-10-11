const labels = {
  zlozone: 'Złożone',
  w_realizacji: 'W realizacji',
  wyslane: 'Wysłane',
  anulowane: 'Anulowane',
}

export function statusLabel(status) {
  return labels[status] ?? status
}
