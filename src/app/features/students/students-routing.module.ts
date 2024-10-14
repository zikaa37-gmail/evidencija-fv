import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepartmentsComponent } from './departments/departments.component';
import { StudentsUploadComponent } from './students-upload/students-upload.component';
import { StudentsComponent } from './students.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: StudentsComponent
      },
      {
        path: 'departments',
        component: DepartmentsComponent
      },
      {
        path: 'upload',
        component: StudentsUploadComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentsRoutingModule { }
