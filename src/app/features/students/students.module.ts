import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentsRoutingModule } from './students-routing.module';
import { DepartmentsComponent } from './departments/departments.component';
import { StudentsComponent } from './students.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { StudentsUploadComponent } from './students-upload/students-upload.component';


@NgModule({
  declarations: [
    StudentsComponent,
    DepartmentsComponent,
    StudentsUploadComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    StudentsRoutingModule
  ]
})
export class StudentsModule { }
