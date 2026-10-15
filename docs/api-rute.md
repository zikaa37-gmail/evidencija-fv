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
| POST | `/classes/list` | Odeljenja tekuće školske godine (`id`, `name`, `grade`, `section`, `head_teacher_*`, `students_count`) |
| POST | `/students/list` | Učenici tekuće godine (opciono `school_class_id`); arhivirani se ne vraćaju |

## Admin (`jwt` + `admin`)

| Metod | Ruta | Opis |
|---|---|---|
| POST | `/classes/sync` | `classes: [{grade, section}]` — dodaje nova, briše uklonjena (422 ako odeljenje ima učenike) |
| POST | `/students` | Novi učenik + upis u odeljenje tekuće godine |
| PUT | `/students/{id}` | Izmena podataka i premeštaj u drugo odeljenje |
| PATCH | `/students/{id}/activate` · `/deactivate` | Status upisa za tekuću godinu |
| DELETE | `/students/{id}` | Brisanje učenika |
| POST | `/students/import` | `students: [{first_name, last_name, sex, class_name, ...}]` — postojeći (isto ime i prezime u tekućoj godini) se ažurira, ostali se dodaju; vraća `{created, updated}` |
