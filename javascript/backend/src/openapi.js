const errorResponse = {
  description: 'Błąd',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
}

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'EMarket API',
    version: '1.0.0',
    description: 'Sklep EMarket. Ceny są w groszach. Koszyk nie jest w tej dokumentacji. Złożenie zamówienia bierze pozycje z koszyka użytkownika zapisanego w bazie.',
  },
  servers: [
    { url: 'http://localhost:4520' },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Kategorie' },
    { name: 'Produkty' },
    { name: 'Zamówienia' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token z logowania albo rejestracji. Ważny 7 dni.',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'validation' },
          message: { type: 'string', example: 'Podaj email' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', example: 'test1234@wp.pl' },
          name: { type: 'string', example: 'Jan Kowalski' },
          is_admin: { type: 'integer', enum: [0, 1], example: 0 },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Kuchnia' },
          slug: { type: 'string', example: 'kuchnia' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          category_id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Czajnik emaliowany 2 l' },
          slug: { type: 'string', example: 'czajnik-emaliowany' },
          description: { type: 'string' },
          price_cents: { type: 'integer', example: 12900 },
          stock: { type: 'integer', example: 14 },
          views: { type: 'integer', example: 1 },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          product_id: { type: 'integer' },
          product_name: { type: 'string' },
          unit_price_cents: { type: 'integer' },
          quantity: { type: 'integer' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          user_id: { type: 'integer' },
          status: { type: 'string', enum: ['zlozone', 'w_realizacji', 'wyslane', 'anulowane'] },
          recipient_name: { type: 'string' },
          address_line: { type: 'string' },
          postal_code: { type: 'string' },
          city: { type: 'string' },
          total_cents: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
        },
      },
      OrderRequest: {
        type: 'object',
        required: ['recipient_name', 'address_line', 'postal_code', 'city'],
        properties: {
          recipient_name: { type: 'string', maxLength: 255, example: 'Jan Kowalski' },
          address_line: { type: 'string', maxLength: 255, example: 'Lipowa 4' },
          postal_code: { type: 'string', maxLength: 255, example: '15-001' },
          city: { type: 'string', maxLength: 255, example: 'Białystok' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Stan API',
        responses: {
          200: {
            description: 'API działa',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { ok: { type: 'boolean', example: true } },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Rejestracja',
        description: 'Imię i email do 255 znaków. Hasło co najmniej 6 znaków. Zajęty email zwraca 409.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', maxLength: 255, example: 'Anna Testowa' },
                  email: { type: 'string', maxLength: 255, example: 'anna@wp.pl' },
                  password: { type: 'string', minLength: 6, example: 'test1234' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Konto utworzone',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          400: errorResponse,
          409: errorResponse,
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Logowanie',
        description: 'Konta z seeda: test1234@wp.pl / test1234 oraz admin1234@wp.pl / admin1234.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'test1234@wp.pl' },
                  password: { type: 'string', example: 'test1234' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Zalogowano',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          400: errorResponse,
          401: errorResponse,
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Bieżący użytkownik',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Zalogowany użytkownik',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          401: errorResponse,
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Wylogowanie',
        description: 'Zwraca 204. Serwer nie unieważnia tokenu.',
        responses: {
          204: { description: 'Wylogowano' },
        },
      },
    },
    '/api/categories': {
      get: {
        tags: ['Kategorie'],
        summary: 'Lista kategorii',
        responses: {
          200: {
            description: 'Kategorie posortowane po nazwie',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
              },
            },
          },
        },
      },
    },
    '/api/categories/{slug}': {
      get: {
        tags: ['Kategorie'],
        summary: 'Kategoria po slugu',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'kuchnia' },
            description: 'kuchnia, elektronika, dom albo sport',
          },
        ],
        responses: {
          200: {
            description: 'Kategoria',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } },
          },
          404: errorResponse,
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Produkty'],
        summary: 'Lista produktów',
        description: 'Nie zwiększa licznika wyświetleń. Cena jest w groszach.',
        parameters: [
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string', example: 'kuchnia' },
            description: 'Slug kategorii',
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string', example: 'deska' },
            description: 'Fragment nazwy albo opisu. Znaki % i _ są wycinane.',
          },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['name', 'price_asc', 'price_desc', 'popularity'] },
            description: 'Inna wartość zwraca 400',
          },
        ],
        responses: {
          200: {
            description: 'Produkty',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
              },
            },
          },
          400: errorResponse,
        },
      },
    },
    '/api/products/{slug}': {
      get: {
        tags: ['Produkty'],
        summary: 'Produkt po slugu',
        description: 'Zwiększa views o 1 i zwraca produkt już po zwiększeniu.',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'czajnik-emaliowany' },
          },
        ],
        responses: {
          200: {
            description: 'Produkt',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
          },
          404: errorResponse,
        },
      },
    },
    '/api/orders': {
      get: {
        tags: ['Zamówienia'],
        summary: 'Lista zamówień',
        description: 'Zamówienia zalogowanego użytkownika, od najnowszego, razem z pozycjami.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Zamówienia',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
              },
            },
          },
          401: errorResponse,
        },
      },
      post: {
        tags: ['Zamówienia'],
        summary: 'Złóż zamówienie',
        description: 'Pola tekstowe mają najwyżej 255 znaków. Pozycje biorą się z koszyka w bazie. Pusty koszyk zwraca 400. Przy sukcesie stan magazynu spada, a pozycje koszyka są kasowane.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/OrderRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Zamówienie zapisane',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } },
          },
          400: errorResponse,
          401: errorResponse,
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Zamówienia'],
        summary: 'Zamówienie po id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', example: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Zamówienie',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } },
          },
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
        },
      },
    },
  },
}
