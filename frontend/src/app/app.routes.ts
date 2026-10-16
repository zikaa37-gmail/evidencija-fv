import { Routes } from '@angular/router';

import { adminGuard, authGuard, guestGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
    title: 'login.login',
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'student-records',
        loadComponent: () =>
          import('./features/calendar/calendar.component').then(
            (m) => m.CalendarComponent,
          ),
        title: 'menu.calendar',
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./features/students/students.component').then(
            (m) => m.StudentsComponent,
          ),
        title: 'menu.students',
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin.component').then((m) => m.AdminComponent),
        children: [
          {
            path: 'school-year',
            loadComponent: () =>
              import('./features/admin/school-year/school-year.component').then(
                (m) => m.SchoolYearComponent,
              ),
            title: 'admin.schoolYear',
          },
          {
            path: 'classes',
            loadComponent: () =>
              import('./features/classes/classes.component').then(
                (m) => m.ClassesComponent,
              ),
            title: 'menu.classes',
          },
          {
            path: 'import',
            loadComponent: () =>
              import(
                './features/students/students-upload/students-upload.component'
              ).then((m) => m.StudentsUploadComponent),
            title: 'menu.uploadStudents',
          },
          {
            path: 'archive',
            loadComponent: () =>
              import('./features/admin/archive/archive.component').then(
                (m) => m.ArchiveComponent,
              ),
            title: 'admin.archive',
          },
          { path: '', pathMatch: 'full', redirectTo: 'school-year' },
        ],
      },
      { path: 'classes', redirectTo: 'admin/classes' },
      { path: 'students/upload', redirectTo: 'admin/import' },
      { path: '', pathMatch: 'full', redirectTo: 'student-records' },
    ],
  },
  {
    path: '**',
    redirectTo: 'student-records',
  },
];
