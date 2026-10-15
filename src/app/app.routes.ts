import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'student-records',
    loadComponent: () =>
      import('./features/calendar/calendar.component').then(
        (m) => m.CalendarComponent,
      ),
    title: 'menu.calendar',
    data: { title: 'menu.calendar' },
  },
  {
    path: 'classes',
    loadComponent: () =>
      import('./features/classes/classes.component').then(
        (m) => m.ClassesComponent,
      ),
    title: 'menu.classes',
    data: { title: 'menu.classes' },
  },
  {
    path: 'students',

    loadComponent: () =>
      import('./features/students/students.component').then(
        (m) => m.StudentsComponent,
      ),
    title: 'menu.students',
    data: { title: 'menu.students' },
  },

  {
    path: 'students/upload',
    loadComponent: () =>
      import(
        './features/students/students-upload/students-upload.component'
      ).then((m) => m.StudentsUploadComponent),
    title: 'menu.uploadStudents',
    data: { title: 'menu.uploadStudents' },
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'student-records',
  },
  {
    path: '**',
    redirectTo: 'student-records',
  },
];
