# EMarket

Aplikacja e-commerce (np. uproszczona wersja Amazona lub innego sklepu internetowego) - pozwala na przeglądanie listy towarów i składanie zamówień.

Sklep nazywa się EMarket. Katalog jest ogólny: kategorie i produkty.

## Zespół

- Gabriela Czajkowska
- Maciej Iwaniuk (lider)
- Kacper Popławski

## Stack

Node.js, Express, Vue 3, Vue Router, Tailwind 4, Docker, SQLite.

## Stan na 18.10.2026

- Widoki Vue działają na przykładowym katalogu w przeglądarce.
- Koszyk, logowanie, rejestracja i złożenie zamówienia działają lokalnie (pamięć karty przeglądarki), żeby dało się przejść ścieżkę klienta.
- Endpointy Express są podpięte, ale metody zwracają `501` i `{ "error": "not_implemented" }`. Wyjątek: `GET /api/health` zwraca `{ "ok": true }`.
- Schemat SQLite jest w `backend/src/db/schema.sql`. Plik bazy jeszcze nie powstaje. Połączenie w `backend/src/db/database.js` nie jest wołane.
- Prawdziwy zapis, hasła, JWT albo sesja i spięcie frontu z API są na kolejne zjazdy.

Konta do przeklikania makiety (to nie są konta w bazie):

- klient: `klient@emarket.test` / `klient123`
- administrator: `admin@emarket.test` / `admin123`

Docelowo o adminie decyduje kolumna `users.is_admin` (0 albo 1). Wartość zmienia się ręcznie w SQLite, bez osobnego ekranu nadawania roli.

## Uruchomienie

Z katalogu `javascript`:

```bash
docker compose -f development/docker-compose.yml up -d
```

- Sklep: http://localhost:4521
- API: http://localhost:4520/api/health

Zatrzymanie:

```bash
docker compose -f development/docker-compose.yml down
```

Przy starcie kontenery same robią `npm install`.

## Struktura

```
javascript/
  README.md
  development/docker-compose.yml
  backend/
    src/index.js
    src/routes/        auth, categories, products, cart, orders
    src/db/schema.sql
    src/db/database.js
    data/              tu będzie emarket.sqlite
  frontend/
    src/views/         widoki klienta i panelu
    src/components/
    src/data/catalog.js
    src/state/         lokalny koszyk, sesja, zamówienia
```

## MVP

Jest w zakresie:

- przeglądanie katalogu, kategorii i karty produktu
- szukanie po nazwie i opisie, sortowanie po cenie i nazwie
- koszyk: dodanie, zmiana ilości, usunięcie, limit stanu magazynowego
- rejestracja i logowanie
- zamówienie tylko po zalogowaniu, z adresem dostawy
- historia zamówień zalogowanego klienta
- status zamówienia (`zlozone`, `w_realizacji`, `wyslane`, `anulowane`) zamiast płatności
- panel administratora: dodawanie, edycja i usuwanie produktów oraz kategorii

## Encje i relacje

- `users` 1 - 1 `carts` (jeden otwarty koszyk na użytkownika)
- `carts` 1 - N `cart_items`
- `categories` 1 - N `products`
- `products` 1 - N `cart_items`
- `users` 1 - N `orders`
- `orders` 1 - N `order_items`
- `order_items` trzyma nazwę i cenę z chwili zakupu

`users`: id, email, password_hash, name, is_admin, created_at.

`categories`: id, name, slug.

`products`: id, category_id, name, slug, description, price_cents, stock, created_at.

`carts`: id, user_id (unikalne).

`cart_items`: id, cart_id, product_id, quantity. Para koszyk + produkt jest unikalna.

`orders`: id, user_id, status, recipient_name, address_line, postal_code, city, total_cents, created_at.

`order_items`: id, order_id, product_id, product_name, unit_price_cents, quantity.

## API

Prefiks `/api`. Na tym etapie każda metoda poza health zwraca 501.

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Kategorie. Zapis tylko dla administratora:

- `GET /categories`
- `GET /categories/:slug`
- `POST /categories`
- `PATCH /categories/:id`
- `DELETE /categories/:id`

Produkty. Zapis tylko dla administratora. Lista przyjmuje query `category`, `q`, `sort`:

- `GET /products`
- `GET /products/:slug`
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`

Koszyk zalogowanego użytkownika:

- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:id`
- `DELETE /cart/items/:id`

Zamówienia zalogowanego użytkownika. `POST /orders` bierze koszyk i adres, potem opróżnia koszyk:

- `POST /orders`
- `GET /orders`
- `GET /orders/:id`

`GET /health` zwraca `{ "ok": true }`.

## Mapa nawigacji

Publiczne:

- `/` katalog
- `/kategoria/:slug`
- `/produkt/:slug`
- `/koszyk`
- `/logowanie`
- `/rejestracja`

Po zalogowaniu:

- `/zamowienie` (bez sesji wraca na logowanie)
- `/zamowienie/potwierdzenie`
- `/konto/zamowienia`

Panel (`is_admin` -> permisja uzytkownika bazuje na kolumnie):

- `/admin/produkty`
- `/admin/produkty/nowy`
- `/admin/produkty/:id`
- `/admin/kategorie`
- `/brak-dostepu` gdy zalogowany klient wejdzie w panel

Produkty do koszyku mozna dodawac bez konta. Samo złożenie zamówienia wymaga logowania.

## Podział zadań

- Kacper Popławski (lider): repozytorium, spójność koncepcji, backend, SQLite, zamówienia, prezentacja.
- Maciej Iwaniuk: katalog, karta produktu, koszyk, checkout.
- Gabriela Czajkowska: ekrany logowania i rejestracji, panel administratora, opis API w tym pliku.

## Plan wkładu

(może ulec zmianie)

1. Node.js
2. Express
3. Projektowanie API i bazy danych
4. Uwierzytelnianie, autoryzacja i bezpieczeństwo
5. Vue.js - reaktywność i komponenty
6. SPA - routing, stan i integracja z backendem
7. Współczesne możliwości aplikacji webowych
8. Zaliczenie wykładu

## Forma zaliczenia wykładu

Wykład zaliczany jest na podstawie testu. Test będzie mieć formę quizu jednokrotnego wyboru rozwiązywanego na komputerach.

Ocena:

- od 95% - bdb
- od 90% - db+
- od 80% - db
- od 70% - dst+
- od 60% - dst
- poniżej 60% - ndst

## Pracownia specjalistyczna

Podstawą zaliczenia i oceny PS jest realizacja projektu zespołowego.

- Projekty realizowane są w zespołach ~3 osobowych.
- Skład zespołu oraz temat projektu zgłaszane są przez lidera grupy.

## Harmonogram zajęć i kryteria zaliczenia projektu

(11.10.2026) Zajęcia organizacyjne.

(18.10.2026) Koncepcja i projekt aplikacji. Wybór tematu, określenie wymagań funkcjonalnych (MVP), podział zadań w zespole, identyfikacja głównych zasobów/encji i relacji między nimi, wstępny projekt API, makiety najważniejszych widoków i mapa nawigacji, utworzenie repozytorium Git.

(25.10.2026) Podstawowe API. Inicjalizacja backendu (Node.js + Express), konfiguracja routingu i middleware, pierwsze endpointy REST, podstawowa walidacja i obsługa błędów. Na tym etapie dane mogą być przechowywane w pamięci lub plikach. Testowanie API za pomocą wybranego klienta HTTP. (10 pkt.)

(15.11.2026) Baza danych i kompletne API. Konfiguracja warstwy dostępu do danych (SQLite jako rozwiązanie bazowe; inne DB po uzgodnieniu), implementacja trwałego CRUD i właściwej dla projektu logiki biznesowej, wyszukiwania/filtrowania/sortowania tam, gdzie ma to zastosowanie. Walidacja danych, osługa błędów w API. (10 pkt.)

(22.11.2026) -

(29.11.2026) Uwierzytelnianie i finalizacja backendu. Rejestracja i logowanie użytkowników, bezpieczne przechowywanie haseł. Uwierzytelnianie i autoryzacja (np. sesje lub JWT), ochrona zasobów, role/uprawnienia tam, gdzie są uzasadnione. Testy najważniejszych przypadków użycia API. Dokumentacja API. Na zakończenie etapu backend powinien realizować komplet funkcjonalności wymaganych przez MVP. (10 pkt.)

(13.12.2026) -

(20.12.2026) Frontend i integracja z API. Inicjalizacja aplikacji Vue. Podział interfejsu na komponenty, implementacja głównych widoków i Vue Router. Komunikacja z przygotowanym API. Formularze, prezentacja danych, stany ładowania i obsługa błędów. Implementacja podstawowych scenariuszy użytkownika end-to-end. (10 pkt.)

(17.01.2027) Kompletna aplikacja i funkcjonalność rozszerzona. Dokończenie interfejsu i integracji wszystkich funkcji MVP. Zarządzanie stanem aplikacji (np. Pinia) tam, gdzie jest potrzebne. Integracja uwierzytelniania z frontendem. Responsywność i dopracowanie UX. Implementacja co najmniej jednej uzasadnionej funkcjonalności/technologii rozszerzonej (np. WebSocket/SSE, PWA/Service Worker, IndexedDB, Web Worker albo innej po ustaleniu z prowadzącym). Testy i poprawki. (10 pkt.)

(24.01.2027) Finalizacja i prezentacja projektu. Przygotowanie wersji końcowej aplikacji. Porządki w repozytorium i dokumentacji, instrukcja uruchomienia/deployment. Prezentacja działania aplikacji i najważniejszych decyzji projektowych. Omówienie wkładu członków zespołu oraz problemów napotkanych podczas realizacji. (50 pkt.)

- Realizacja wymagań i działanie aplikacji - 10 pkt
- Jakość rozwiązania technicznego - 10 pkt
  - sensowny podział na moduły/komponenty, czytelność i spójność kodu, poprawne wykorzystanie frameworków
- Bezpieczeństwo i poprawność obsługi danych - 5 pkt
- UI, UX i jakość interfejsu - 5 pkt
  - responsywność, spójność interfejsu, czytelność, poprawność formularzy i komunikatów, informowanie o błędach i trwających operacjach, sensowną nawigację oraz brak elementów ewidentnie utrudniających korzystanie z aplikacji
- Rozszerzenie techniczne - 10 pkt
  - Wykorzystanie co najmniej jednego mechanizmu wykraczającego poza podstawowy stos omawiany na zajęciach. Rozszerzenie powinno mieć uzasadnienie w funkcjonalności aplikacji i być poprawnie zintegrowane z pozostałą częścią systemu.
- Dokumentacja, prezentacja, obrona - 10 pkt
  - Dokumentacja: plik README z krótkim opisem aplikacji, głównych funkcje, struktury plików, instrukcją uruchomienia, zrzuty ekranu.
  - Prezentacja: demo aplikacji w typowych scenariuszach użytkownika, omówienie wybranych fragmentów kodu, decyzji projektowych, problemów i ich rozwiązań, podziału pracy w zespole (przy ocenianiu pod uwagę będzie brany również indywidualny wkład członków zespołu).

Wszelkie plagiaty i kopiowanie kodu bez zrozumienia skutkują niezaliczeniem.

Dozwolone jest korzystanie z narzędzi AI jako pomocy, uzupełnienie dokumentacji czy przeglądarki, ale nie do zastępowania nas w pracy. Zespół przedstawia kod jako własny i w pełni za niego odpowiada. Dopuszczalne jest generowanie tych elementów, które nie są lub nie chcemy by były oceniane.

## Skala ocen

- od 51% - dst
- od 61% - dst+
- od 71% - db
- od 81% - db+
- od 91% - bdb
