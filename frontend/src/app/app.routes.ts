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
        path: 'classes',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/classes/classes.component').then(
            (m) => m.ClassesComponent,
          ),
        title: 'menu.classes',
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
        path: 'students/upload',
        canActivate: [adminGuard],
        loadComponent: () =>
          import(
            './features/students/students-upload/students-upload.component'
          ).then((m) => m.StudentsUploadComponent),
        title: 'menu.uploadStudents',
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'student-records',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'student-records',
  },
];
