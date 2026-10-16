# Deploy na cPanel (evidencija.fiskultura.rs)

Isti hosting i isti obrazac kao `D:\Playground\Angular\kosarkaska-evidencija\docs\DEPLOY.md`:
nema SSH-a, paketi idu preko FTP-a, a jednokratni PHP fajl na serveru ih raspakuje i pokrene migracije.

## Jednom, pre prvog deploy-a (ručno u cPanel-u)

1. Poddomen `evidencija.fiskultura.rs` već postoji (document root `~/evidencija.fiskultura.rs`, ranije je
   tu bio stari statički build ove aplikacije — rezervna kopija je lokalno u
   `deploy/backup-evidencija.fiskultura.rs-2026-10-16/`, van gita).
2. Baza: koristi se postojeća deljena baza `fiskultu_porucivanje` (isti nalog kao kosarkaska-evidencija),
   razdvojena prefiksom `DB_PREFIX=efv_`. Ništa ne treba praviti.
3. **Cron Jobs** (trajno, za automatski prelazak školske godine 1. septembra):

   ```
   * * * * * /usr/local/bin/php /home/fiskultu/evidencija_app/artisan schedule:run >> /dev/null 2>&1
   ```

## Folderi na serveru

```
~/evidencija.fiskultura.rs/   <- document root poddomena (javno)
  index.php                      <- iz deploy/index.php (sa imenom app foldera)
  .htaccess                      <- iz deploy/htaccess-production (samo pri prvom deploy-u)
  index.html, *.js, *.css        <- Angular build

~/evidencija_app/             <- Laravel aplikacija, NIJE javna
  app/ bootstrap/ config/ database/ routes/ storage/ vendor/ .env
```

## Deploy (jedna komanda)

Podešavanja su u `deploy/.env` (van gita; šablon `deploy/.env.example`): FTP nalog i baza kao
kosarkaska-evidencija, `DB_PREFIX=efv_`, sopstveni `APP_KEY`, `JWT_SECRET`, `DEPLOY_SECRET`.

```bash
python deploy/deploy.py --seed        # PRVI deploy: migracije + dummy podaci i probni nalozi
python deploy/deploy.py               # svaki sledeći: build (sa testovima) + upload + migracije + provera
python deploy/deploy.py --skip-tests  # bez backend testova
python deploy/deploy.py --skip-build  # samo upload postojećih paketa
```

Šta radi:

1. `deploy/build-release.sh`: backend testovi, `backend-production-build/` (composer `--no-dev`, bez `.env`,
   testova i `.exe`), produkcioni Angular build, zipovi `deploy/evidencija-fv-app.zip` i `-web.zip`.
2. FTP: zipovi, produkcioni `.env` (bez `FTP_*` / `DEPLOY_*` redova), `index.php`, `.htaccess` (samo ako ga
   nema — kasnije izmene ručno, jer cPanel dodaje svoj blok na vrh) i jednokratni `_deploy-<nasumično>.php`.
3. HTTPS poziv tog fajla (zaštićen `DEPLOY_SECRET`-om): raspakivanje, brisanje starih JS/CSS fajlova i keša,
   `migrate --force` (i `db:seed --force` uz `--seed`), pa fajl briše samog sebe.
4. Provera: `/` i `/login` → 200, `/api/auth/me` bez tokena → 401.

`--seed` samo pri PRVOM deploy-u: seeder pravi školu, školsku godinu, odeljenja, dummy učenike i probne
naloge (`admin@evidencija.test` / `nastavnik@evidencija.test`, lozinka `lozinka123`) — ponovno pokretanje bi
dupliralo podatke.

Postupak je lokalno proveren simulacijom servera (isti folderi, PHP server sa pravilima kao `.htaccess`,
posebna test baza): raspakivanje, migracije, seed, prijava i stranice rade.

## Napomene sa servera

- MySQL na serveru dozvoljava indeks do 1000 bajtova, pa je `Schema::defaultStringLength(191)` u
  `AppServiceProvider`, a `failed_jobs.connection` / `queue` su skraćeni na 100 znakova. Nove migracije:
  složeni indeksi preko stringova moraju da stanu u 1000 bajtova (utf8mb4 = 4 bajta po znaku).
- Prvi deploy je urađen 16.10.2026 (`--seed`): 16 odeljenja × 30 učenika, probni nalozi. Sledeći deploy-i
  idu bez `--seed`.

## Bezbednost

Ne upisivati stvarne lozinke ni ključeve u repo. `deploy/.env` i zipovi su u `.gitignore`.
