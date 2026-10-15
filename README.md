# Evidencija FV

Evidencija učenika na časovima fizičkog vaspitanja.

- `frontend/` — Angular 22
- `backend/` — Laravel 13 + MySQL (prefiks tabela `efv_`)

```bash
cd backend && composer install && php artisan migrate:fresh --seed && php artisan serve
cd frontend && npm install && ng serve      # http://localhost:4200
```

Lokalni nalozi (seed): `admin@evidencija.test` i `nastavnik@evidencija.test`, lozinka `lozinka123`.

Konvencije: `CLAUDE.md`. Plan rada: `docs/TODO.md`. API: `docs/api-rute.md`. Git radni tok: `docs/git-workflow.md`.
