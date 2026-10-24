import bcrypt from 'bcryptjs'

const categories = [
  { name: 'Kuchnia', slug: 'kuchnia' },
  { name: 'Elektronika', slug: 'elektronika' },
  { name: 'Dom', slug: 'dom' },
  { name: 'Sport', slug: 'sport' },
]

const products = [
  {
    categorySlug: 'kuchnia',
    name: 'Czajnik emaliowany 2 l',
    slug: 'czajnik-emaliowany',
    description: 'Emaliowany czajnik do płyty gazowej i indukcji. Gwizdek odcina się, gdy woda się zagotuje.',
    priceCents: 12900,
    stock: 14,
  },
  {
    categorySlug: 'kuchnia',
    name: 'Deska dębowa',
    slug: 'deska-debowa',
    description: 'Gruba deska z dębu do krojenia chleba i warzyw. Olejowana, bez lakieru.',
    priceCents: 8900,
    stock: 8,
  },
  {
    categorySlug: 'elektronika',
    name: 'Słuchawki nauszne',
    slug: 'sluchawki-nauszne',
    description: 'Zamknięte słuchawki z kablem 1,5 m. Pałąk wyściełany, wtyk 3,5 mm.',
    priceCents: 15900,
    stock: 20,
  },
  {
    categorySlug: 'elektronika',
    name: 'Lampka z regulowanym ramieniem',
    slug: 'lampka-biurkowa',
    description: 'Lampka na biurko z ciepłym światłem i ramieniem, które zostaje w ustawionej pozycji.',
    priceCents: 21900,
    stock: 6,
  },
  {
    categorySlug: 'dom',
    name: 'Koc wełniany',
    slug: 'koc-welniany',
    description: 'Koc z mieszanki wełny, 140 na 200 cm. Nadaje się na kanapę i do prania w zimnej wodzie.',
    priceCents: 18900,
    stock: 11,
  },
  {
    categorySlug: 'dom',
    name: 'Wazon ceramiczny',
    slug: 'wazon-ceramiczny',
    description: 'Wąski wazon z gliny szkliwionej na jasny beż. Stoi stabilnie na półce.',
    priceCents: 7400,
    stock: 4,
  },
  {
    categorySlug: 'sport',
    name: 'Skakanka stalowa',
    slug: 'skakanka-stalowa',
    description: 'Linka stalowa w osłonie i łożyskowane rączki. Długość do skrócenia.',
    priceCents: 3900,
    stock: 30,
  },
  {
    categorySlug: 'sport',
    name: 'Mata treningowa',
    slug: 'mata-treningowa',
    description: 'Mata 180 na 60 cm, grubość 1 cm. Nie ślizga się na panelu i na płytkach.',
    priceCents: 9900,
    stock: 9,
  },
]

export function seedIfEmpty(database) {
  const categoriesCount = database.prepare('SELECT COUNT(*) AS count FROM categories').get()

  if (categoriesCount.count > 0) {
    return
  }

  const now = new Date().toISOString()
  const insertCategory = database.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)')
  const insertProduct = database.prepare(`
    INSERT INTO products (category_id, name, slug, description, price_cents, stock, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const insertUser = database.prepare(`
    INSERT INTO users (email, password_hash, name, is_admin, created_at)
    VALUES (?, ?, ?, ?, ?)
  `)

  database.exec('BEGIN')

  try {
    for (const category of categories) {
      insertCategory.run(category.name, category.slug)
    }

    for (const product of products) {
      const category = database.prepare('SELECT id FROM categories WHERE slug = ?').get(product.categorySlug)
      insertProduct.run(
        category.id,
        product.name,
        product.slug,
        product.description,
        product.priceCents,
        product.stock,
        now,
      )
    }

    insertUser.run('test1234@wp.pl', bcrypt.hashSync('test1234', 10), 'Jan Kowalski', 0, now)
    insertUser.run('admin1234@wp.pl', bcrypt.hashSync('admin1234', 10), 'Zbigniew Kowalski', 1, now)
    database.exec('COMMIT')
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }
}
