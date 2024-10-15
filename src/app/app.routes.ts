import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'calendar',
    loadComponent: () =>
      import('./features/calendar/calendar.component').then(
        (m) => m.CalendarComponent,
      ),
  },
  {
    path: 'students',
    children: [
      {
        path: '',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/students/students.component').then(
                (m) => m.StudentsComponent,
              ),
          },
          {
            path: 'departments',
            loadComponent: () =>
              import(
                './features/students/departments/departments.component'
              ).then((m) => m.DepartmentsComponent),
          },
          {
            path: 'upload',
            loadComponent: () =>
              import(
                './features/students/students-upload/students-upload.component'
              ).then((m) => m.StudentsUploadComponent),
          },
        ],
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'calendar',
  },
  {
    path: '**',
    redirectTo: 'calendar',
  },
];
