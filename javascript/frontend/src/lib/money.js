const priceFormat = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
})

export function formatPrice(cents) {
  return priceFormat.format(cents / 100)
}

const dateFormat = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'long',
})

export function formatDate(iso) {
  return dateFormat.format(new Date(iso))
}
