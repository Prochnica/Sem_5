export const categories = [
  { id: 1, name: 'Kuchnia', slug: 'kuchnia', swatch: '#8c3f24' },
  { id: 2, name: 'Elektronika', slug: 'elektronika', swatch: '#2f4a3c' },
  { id: 3, name: 'Dom', slug: 'dom', swatch: '#3d4c6b' },
  { id: 4, name: 'Sport', slug: 'sport', swatch: '#6b3d2a' },
]

export const products = [
  {
    id: 1,
    categoryId: 1,
    name: 'Czajnik emaliowany 2 l',
    slug: 'czajnik-emaliowany',
    description: 'Emaliowany czajnik do płyty gazowej i indukcji. Gwizdek odcina się, gdy woda się zagotuje.',
    priceCents: 12900,
    stock: 14,
  },
  {
    id: 2,
    categoryId: 1,
    name: 'Deska dębowa',
    slug: 'deska-debowa',
    description: 'Gruba deska z dębu do krojenia chleba i warzyw. Olejowana, bez lakieru.',
    priceCents: 8900,
    stock: 8,
  },
  {
    id: 3,
    categoryId: 2,
    name: 'Słuchawki nauszne',
    slug: 'sluchawki-nauszne',
    description: 'Zamknięte słuchawki z kablem 1,5 m. Pałąk wyściełany, wtyk 3,5 mm.',
    priceCents: 15900,
    stock: 20,
  },
  {
    id: 4,
    categoryId: 2,
    name: 'Lampka z regulowanym ramieniem',
    slug: 'lampka-biurkowa',
    description: 'Lampka na biurko z ciepłym światłem i ramieniem, które zostaje w ustawionej pozycji.',
    priceCents: 21900,
    stock: 6,
  },
  {
    id: 5,
    categoryId: 3,
    name: 'Koc wełniany',
    slug: 'koc-welniany',
    description: 'Koc z mieszanki wełny, 140 na 200 cm. Nadaje się na kanapę i do prania w zimnej wodzie.',
    priceCents: 18900,
    stock: 11,
  },
  {
    id: 6,
    categoryId: 3,
    name: 'Wazon ceramiczny',
    slug: 'wazon-ceramiczny',
    description: 'Wąski wazon z gliny szkliwionej na jasny beż. Stoi stabilnie na półce.',
    priceCents: 7400,
    stock: 4,
  },
  {
    id: 7,
    categoryId: 4,
    name: 'Skakanka stalowa',
    slug: 'skakanka-stalowa',
    description: 'Linka stalowa w osłonie i łożyskowane rączki. Długość do skrócenia.',
    priceCents: 3900,
    stock: 30,
  },
  {
    id: 8,
    categoryId: 4,
    name: 'Mata treningowa',
    slug: 'mata-treningowa',
    description: 'Mata 180 na 60 cm, grubość 1 cm. Nie ślizga się na panelu i na płytkach.',
    priceCents: 9900,
    stock: 9,
  },
]

export function categoryById(id) {
  return categories.find((category) => category.id === id) ?? null
}

export function categoryBySlug(slug) {
  return categories.find((category) => category.slug === slug) ?? null
}

export function productBySlug(slug) {
  return products.find((product) => product.slug === slug) ?? null
}

export function productById(id) {
  return products.find((product) => product.id === Number(id)) ?? null
}

export function filterProducts({ categorySlug, query, sort }) {
  let list = products.slice()

  if (categorySlug) {
    const category = categoryBySlug(categorySlug)
    list = category ? list.filter((product) => product.categoryId === category.id) : []
  }

  const needle = query?.trim().toLowerCase()
  if (needle) {
    list = list.filter((product) => {
      return product.name.toLowerCase().includes(needle) || product.description.toLowerCase().includes(needle)
    })
  }

  if (sort === 'price_asc') {
    list.sort((left, right) => left.priceCents - right.priceCents)
  } else if (sort === 'price_desc') {
    list.sort((left, right) => right.priceCents - left.priceCents)
  } else if (sort === 'name') {
    list.sort((left, right) => left.name.localeCompare(right.name, 'pl'))
  }

  return list
}

export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
