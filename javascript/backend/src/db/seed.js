import bcrypt from 'bcryptjs'
import { eq, sql } from 'drizzle-orm'
import { categories, products, users } from './schema.js'

const categoryRows = [
  { name: 'Kuchnia', slug: 'kuchnia' },
  { name: 'Elektronika', slug: 'elektronika' },
  { name: 'Dom', slug: 'dom' },
  { name: 'Sport', slug: 'sport' },
]

const productRows = [
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

export function seedIfEmpty(db) {
  const row = db.select({ count: sql`count(*)`.mapWith(Number) }).from(categories).get()

  if (Number(row?.count ?? 0) > 0) {
    return
  }

  const now = new Date().toISOString()

  db.transaction((tx) => {
    for (const category of categoryRows) {
      tx.insert(categories).values(category).run()
    }

    for (const product of productRows) {
      const category = tx.select({ id: categories.id }).from(categories).where(eq(categories.slug, product.categorySlug)).get()
      tx.insert(products).values({
        category_id: category.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price_cents: product.priceCents,
        stock: product.stock,
        views: 0,
        created_at: now,
      }).run()
    }

    tx.insert(users).values([
      {
        email: 'test1234@wp.pl',
        password_hash: bcrypt.hashSync('test1234', 10),
        name: 'Jan Kowalski',
        is_admin: 0,
        created_at: now,
      },
      {
        email: 'admin1234@wp.pl',
        password_hash: bcrypt.hashSync('admin1234', 10),
        name: 'Zbigniew Kowalski',
        is_admin: 1,
        created_at: now,
      },
    ]).run()
  })
}
