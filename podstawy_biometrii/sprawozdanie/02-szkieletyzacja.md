# Zadanie 2. Szkieletyzacja Zhang-Suen

Widok „Szkieletyzacja” w aplikacji bierze obraz binarny z modułu 1 i ścienia go algorytmem Zhang-Suen. Implementacja jest własna, w `frontend/src/lib/zhangSuen.js`.

## Algorytm

Obiekt to piksel 1, tło to 0. Sąsiedzi P2-P9 idą zgodnie z ruchem wskazówek zegara, zaczynając od góry. Jedna iteracja ma dwie półiteracje. Piksel kasuje się dopiero po przejściu całej półiteracji, gdy jednocześnie:

- ma od 2 do 6 sąsiadów obiektu,
- w okręgu sąsiadów jest dokładnie jedno przejście z 0 do 1,
- w pierwszej półiteracji iloczyny P2 P4 P6 oraz P4 P6 P8 są zerowe,
- w drugiej półiteracji iloczyny P2 P4 P8 oraz P2 P6 P8 są zerowe.

Pierwsza półiteracja zdejmuje piksele od południowego wschodu, druga od północnego zachodu. Dzięki temu linia nie znika w jednym przejściu. Koniec następuje, gdy pełna iteracja nic nie skasuje, albo gdy dojdzie limit z suwaka. Klatki są zapamiętane, więc suwak iteracji tylko podmienia obraz.

Moduł 1 maluje na biało piksele jaśniejsze od progu. Odcisk i podpis są zwykle ciemne, dlatego domyślnie ścieniane są ciemne piksele. Da się przełączyć na jasne.

## Ekran

W jednym rzędzie widać obraz kolorowy, binaryzację i szkielet wybranej iteracji. Niżej jest własny wynik po ostatniej wykonanej iteracji oraz wynik funkcji `thinningZS` z biblioteki `skeleton-tracing-js`. Ta funkcja też realizuje Zhang-Suen. Paczka npm `zhang-suen` jest dodatkiem w C++ i na Node 22 się nie buduje, więc referencją jest czysty JavaScript z `skeleton-tracing-js`.

Pod suwakami widać liczbę iteracji, czy algorytm stanął sam, oraz czas własnego liczenia i czas biblioteki. Zapis PNG bierze oglądaną klatkę szkieletu.

## Wynik na kot.png

Plik `frontend/kot.png` ma 219 na 148 pikseli. Próg ręczny 128, obiekt ciemny:

- algorytm stanął po 11 iteracjach,
- obiekt z 3652 pikseli zszedł do 518,
- czas własny 5 ms, biblioteka 11 ms,
- różnica z biblioteką: 0 pikseli.

Otsu wyliczył na tym zdjęciu ten sam próg 128, więc szkielet jest ten sam. Niblack (okno 15, k = -0,2) daje inny obraz binarny: 21068 jasnych pikseli zamiast 28760. Szkielet tego wejścia stanął po 8 iteracjach i też ma 0 różnic z biblioteką.

Gdy suwak maksymalnej liczby iteracji utnie liczenie wcześniej, biblioteka i tak dochodzi do końca. Różnica pikseli jest wtedy duża i opis na ekranie mówi, że to niedokończone ścienianie, a nie błąd wzoru.

## Wniosek

Na gładkim obiekcie po jednym progu Zhang-Suen schodzi do cienkiej linii i zgadza się z niezależną implementacją co do piksela. Niblack zostawia więcej lokalnego kontrastu w masce binarnej, więc szkielet idzie także po fakturze, której jeden próg nie widzi. Sam wzór ścieniania jest ten sam: różnica wyniku bierze się z wejścia binarnego, nie z innego algorytmu.
