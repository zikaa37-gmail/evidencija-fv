# Evidencija FV

## Project

Evidencija učenika na časovima fizičkog vaspitanja u jednoj školi:

- `frontend/`: Angular 22 SPA (zoneless, OnPush podrazumevan, signali). Odeljenja
  (`features/classes`), učenici i uvoz iz Excela (`features/students`), kalendar sa evidencijom
  po danu (`features/calendar`). UI: Angular Material + Bootstrap, prevodi preko `@ngx-translate`
  (`frontend/public/translations/sr.json`).
- `backend/`: Laravel 13 API sa MySQL, prefiks tabela `efv_` (`DB_PREFIX`). Lokalno zasebna baza
  `evidencija_fv`; na serveru deljena baza, razdvajanje isključivo preko prefiksa.
- `docs/`: plan (`TODO.md`), API rute (`api-rute.md`), radni tok (`git-workflow.md`).

Domen: škola (`schools`) → školska godina (`school_years`, jedna `is_current`) → odeljenja
(`school_classes`: razred 5–8 + broj odeljenja, razredni starešina) → upis učenika u odeljenje za
tu godinu (`enrollments`, status aktivan/neaktivan). Učenik (`students`) traje kroz godine; osmaci
posle završetka idu u arhivu (`archived_at`). Sve se vezuje za konkretan `school_year_id`.
1. septembra svako odeljenje prelazi razred gore (5-1 → 6-1), četvrtaci dolaze u nova 5-x
odeljenja, osmaci u arhivu (#30). Admin poslovi (odeljenja, učenici, prelazak godine) su odvojeni
od svakodnevne evidencije (#32).

Plan upgrade-a i modernizacije: `docs/TODO.md`. Radni tok (issue → grana → PR): `docs/git-workflow.md`.
Isti obrazac kao `D:\Playground\Angular\kosarkaska-evidencija` — pogledaj taj repo za
referentne konvencije ako nešto ovde nije eksplicitno napisano.

## Working conventions

- Sva komunikacija sa korisnikom ide isključivo na srpskom (latinica). Engleski ostaje samo u
  kodu i identifikatorima.
- Kod je na engleskom (identifikatori, rute, ključevi). Tekst u UI-ju ide kroz prevode
  (`public/translations/sr.json`), ne hardkodovan u šablonima.
- Bez komentara u kodu — identifikatori treba da budu samoobjašnjivi. Zakomentarisan stari kod
  se briše, ne ostavlja.
- Preserve unrelated user changes in the working tree.
- Angular: koristi novu signal-baziranu sintaksu, ne stare dekoratore. `input()`/`input.required()`
  umesto `@Input()`, `output()` umesto `@Output()`, `viewChild()`/`viewChildren()`/`contentChild()`/
  `contentChildren()` umesto dekoratora, `model()` za two-way binding. Čitanje je uvek poziv funkcije
  (`this.title()`, `{{ title() }}`). Injekcija ide preko `inject()`, ne kroz parametre konstruktora.
  Statični host binding-i idu u `host: {...}` metapodatke.
- Nema `@NgModule`-a — sve su standalone komponente/direktive/pipe-ovi; ne pisati `standalone: true`
  (podrazumevano je). U `imports` idu konkretni pipe-ovi/direktive, ne ceo `CommonModule`.
- Šabloni: `@if`/`@for`/`@switch`, `[class.x]` umesto `ngClass`, `[style.x]` umesto `ngStyle`.
- Stanje komponenti i servisa je u signalima; izvedene vrednosti preko `computed()`. Nema
  getter/setter (`get x()`/`set x()`) property-a.
- Podaci za Material dijalog idu kroz `dialog.open(X, { data })` + `inject(MAT_DIALOG_DATA)`, ne
  preko `dialogRef.componentInstance`.
- Čitanje sa API-ja ide preko `httpResource` u servisu (`hasValue() ? value() : []` u `computed`),
  uz `LoaderService.watch(resource.isLoading)` i `effect` koji na `error()` zove
  `ErrorHandlerService.notify`. Upis (POST/PATCH/DELETE) ide preko `HttpClient` umotanog u
  `LoaderService.track(...)`; posle uspeha lokalno se ažurira `resource.value`. Ne postavljati
  `isLoading` ručno.
- Obaveštenja korisniku idu kroz `NotificationService` (`MatSnackBar`), tekst iz prevoda (`toaster.*`).
- Destruktivne akcije idu kroz zajednički `ConfirmationModalComponent`; ne uvoditi `window.confirm()`.
- Ne dodavati tajne u repozitorijum. Lokalni backend kredencijali idu u `backend/.env`.
- Backend: kontroleri u `app/Http/Controllers/Api`, odgovor se slaže u `present()` metodi
  kontrolera (snake_case ključevi), validacija preko `$request->validate(...)`. API čitanja sa
  filterima idu kao `POST .../list` sa JSON telom (kao u kosarkaska-evidencija); `GET` samo za id
  u putanji i jednostavna čitanja bez filtera. Pri izmeni ruta ažuriraj `docs/api-rute.md`.

## Local development

Backend (iz `backend/`):

```bash
composer install
php artisan migrate:fresh --seed
php artisan serve
```

Frontend (iz `frontend/`; `/api` ide preko `proxy.conf.json` na `localhost:8000`):

```bash
npm install
ng serve
```

Provera posle izmena: `php artisan test` (backend), `ng build`, `ng test`, `ng lint` (frontend).
