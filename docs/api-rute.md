# API rute

Osnova: `/api` (lokalno frontend ide preko `frontend/proxy.conf.json` na `http://localhost:8000`).
Zaštićene rute traže `Authorization: Bearer <access_token>` (middleware `jwt`); admin rute još i
middleware `admin` (uloga `admin`).

## Auth (javno)

| Metod | Ruta | Opis |
|---|---|---|
| POST | `/auth/login` | `email`, `password` → `access_token`, `refresh_token`, `user` (ograničeno na 10/min) |
| POST | `/auth/refresh` | `refresh_token` → novi par tokena (stari refresh token se opoziva) |
| POST | `/auth/logout` | `refresh_token` → opoziva refresh token |

## Prijavljeni korisnik (`jwt`)

| Metod | Ruta | Opis |
|---|---|---|
| GET | `/auth/me` | Prijavljeni korisnik (`id`, `name`, `email`, `role`, `school_id`) |
| POST | `/auth/change-password` | `current_password`, `password`, `password_confirmation` → opoziva sve refresh tokene |
| GET | `/school-years/current` | Tekuća školska godina sa školom (`id`, `name`, `starts_on`, `ends_on`, `school`) |
