import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'calendar',
    loadChildren: () =>
      import('./features/calendar/calendar.module').then(
        (m) => m.CalendarModule
      ),
  },
  {
    path: 'students',
    loadChildren: () =>
      import('./features/students/students.module').then(
        (m) => m.StudentsModule
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'calendar'
  },
  {
    path: '**',
    redirectTo: 'calendar'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
