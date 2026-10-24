const priceFormat = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
})

export function formatPriceFromCents(priceCents) {
  return priceFormat.format(priceCents / 100)
}

const dateFormat = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'long',
})

export function formatDateFromIsoString(isoDate) {
  return dateFormat.format(new Date(isoDate))
}
