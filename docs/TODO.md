# Plan: upgrade na Angular 22 i modernizacija

Polazno stanje: Angular 18.2.8, TypeScript 5.5, zone.js 0.14, webpack (`browser`) builder.
Trenutno: Angular 22.2, TypeScript 6.0, zoneless (bez zone.js), esbuild (`@angular/build:application`), signali svuda.

| Issue | Zadatak | Status |
|---|---|---|
| #4 | Pravila rada: `CLAUDE.md`, `docs/TODO.md`, pre-push hook | ✅ |
| #5 | Čišćenje nekorišćenih paketa i dupliranih stilova | ✅ |
| #6 | Angular 18 → 19 (ng-bootstrap 18, ngx-translate 16) | ✅ |
| #7 | Angular 19 → 20 (ng-bootstrap 19, ngx-translate 17, `application` builder) | ✅ |
| #8 | Angular 20 → 21 (ng-bootstrap 20, ngx-toastr → `MatSnackBar`) | ✅ |
| #9 | Angular 21 → 22 (Node 24 LTS, TS 6, ng-bootstrap 21, ngx-translate 18) | ✅ |
| #10 | `input()`/`output()`/`model()`, `inject()`, moderni šabloni | ✅ |
| #11 | Stanje u signalima, dijalozi preko `data`, `httpResource` | ✅ |
| #12 | OnPush svuda, zoneless | ✅ |
| #13 | Sass `@use`, Material M3 tema, `xlsx` sa CDN-a, Vitest, ESLint | |
| #14 | Bagovi u kalendaru i uvozu učenika | ✅ |
| #18 | Restrukturiranje `frontend/` + `backend/`, Laravel 13 + MySQL (`efv_`), šema, seed | ✅ |
| #19 | Autentifikacija nastavnika (JWT), uloge admin / korisnik | ✅ |
| #20 | Odeljenja (API + frontend) | ✅ |
| #21 | Učenici (API + frontend), Excel uvoz za nove đake i izmene | ✅ |
| #30 | Prelazak u novu školsku godinu (1. septembar) | ✅ |
| #32 | Admin deo vs. korisnički deo, obaveštenja jun–avgust | ✅ |
| #22 | Evidencija na času (izostanci, oprema...) | |
| #23 | Napomene (pohvale / opomene) | |
| #24 | Izveštaji | |
| #15 | Deploy na cPanel | |

## Napomene

- Angular 22 traži Node `^22.22.3 || ^24.15.0`.
- `ngx-toastr` nema verziju za Angular 22 — zamenjuje se sa `MatSnackBar` (#8).
- `xlsx` 0.18.5 sa npm-a ima poznate ranjivosti; ispravljene verzije su samo na cdn.sheetjs.com (#13).
