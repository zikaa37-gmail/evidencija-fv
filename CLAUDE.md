# Evidencija FV

## Project

Angular SPA za evidenciju učenika na časovima fizičkog vaspitanja: odeljenja (`features/classes`),
učenici i uvoz iz Excela (`features/students`), kalendar sa evidencijom po danu
(`features/calendar`). UI: Angular Material + Bootstrap, prevodi preko `@ngx-translate`
(`public/translations/sr.json`).

Backend za sada ne postoji (`environment.apiUrl` = `http://localhost:3000`) — vidi issue #15.

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
- Destruktivne akcije idu kroz zajednički `ConfirmationModalComponent`; ne uvoditi `window.confirm()`.
- Ne dodavati tajne u repozitorijum.

## Local development

```bash
npm install
ng serve
```

Provera posle izmena:

```bash
ng build
```
