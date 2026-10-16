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
| GET | `/school-years/current` | Tekuća školska godina škole korisnika (`id`, `name`, `starts_on`, `ends_on`, `preparation_starts_on`, `in_preparation`, `edit_window_days`, `school`) |
| POST | `/attendance/list` | `school_class_id`, `from`, `to` → oznake `[{student_id, date, reason}]` |
| PUT | `/attendance` | `student_id`, `date`, `reason` (`absent`/`equipment`/`pity`/`late`/`ill`, `null` briše) — samo poslednjih 7 dana |
| POST | `/notes/list` | `school_class_id` → pohvale i opomene (`can_delete`) |
| POST | `/notes` | `student_id`, `date`, `type` (`good`/`bad`), `text` — samo poslednjih 7 dana |
| DELETE | `/notes/{id}` | Autor ili admin, samo u okviru 7 dana |
| POST | `/reports/class` | `school_class_id`, `from`, `to` → po učeniku zbir oznaka po vrsti, `total`, `praises`, `warnings` (uz `sex`, `photo`) |
| POST | `/reports/student` | `student_id`, `from`, `to` → zbir kao gore + `records: [{date, reason}]` i `notes: [{date, type, text, author_name}]` |
| POST | `/classes/list` | Odeljenja tekuće školske godine (`id`, `name`, `grade`, `section`, `head_teacher_*`, `students_count`) |
| POST | `/students/list` | Učenici tekuće godine (opciono `school_class_id`); arhivirani se ne vraćaju |

## Admin (`jwt` + `admin`)

| Metod | Ruta | Opis |
|---|---|---|
| GET | `/school-years/rollover/preview` | Pregled prelaska: koja odeljenja prelaze, ko ide u arhivu, broj novih 5-x odeljenja, `can_rollover` |
| POST | `/school-years/rollover` | `first_grade_sections` — prelazak u novu školsku godinu (od 20. juna; automatski 1. septembra komandom `school-year:rollover`) |
| POST | `/students/archive/list` | Arhivirani učenici (poslednje odeljenje i godina, `completed`) |
| POST | `/classes/sync` | `classes: [{grade, section}]` — dodaje nova, briše uklonjena (422 ako odeljenje ima učenike) |
| POST | `/students` | Novi učenik + upis u odeljenje tekuće godine; `photo` je opcioni data URL (jpeg/png/webp, do 400 000 znakova) |
| PUT | `/students/{id}` | Izmena podataka i premeštaj u drugo odeljenje |
| PATCH | `/students/{id}/activate` · `/deactivate` | Status upisa za tekuću godinu |
| DELETE | `/students/{id}` | Brisanje učenika |
| POST | `/students/import` | `students: [{first_name, last_name, sex, class_name, ...}]` — postojeći (isto ime i prezime u tekućoj godini) se ažurira (fotografija ostaje), ostali se dodaju; vraća `{created, updated}` |
