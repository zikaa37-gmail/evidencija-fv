import { Component, inject, OnInit } from '@angular/core';
import { CalendarService } from '../../calendar/calendar.service';
import { Student, StudentStatus } from '../students.interface';
import { StudentsService } from '../students.service';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { XlsxFileUploadComponent } from 'src/app/shared/components/xlsx-file-upload/xlsx-file-upload.component';
import { ClassSelectorComponent } from 'src/app/shared/class-selector/class-selector.component';
import { CardComponent } from 'src/app/shared/components/card/card.component';

@Component({
    selector: 'app-students-upload',
    templateUrl: './students-upload.component.html',
    styleUrls: ['./students-upload.component.scss'],
    imports: [
        CommonModule,
        TranslateModule,
        ClassSelectorComponent,
        XlsxFileUploadComponent,
        CardComponent,
    ]
})
export class StudentsUploadComponent {
  private studentsService = inject(StudentsService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private calendarService = inject(CalendarService);
  students: Student[] = [];
  filteredStudents: Student[] = [];

  selectedClass = '5-1';
  selectedStudent: Student | null = null;

  mapData(data: any) {
    for (let i = 0; i < data.length; i++) {
      const dataRow: any[] = data[i];

      for (let x = 0; x < dataRow.length; x++) {
        const row = dataRow[x];
        const student = this.studentsService.mapStudentFromExcelData(row);
        if (i === 0) {
          this.selectedClass = student.className;
        }
        this.students.push(student);
      }
    }
    this.filterStudents();
  }

  setSelectedClass(className: string) {
    this.selectedClass = className;
  }

  filterStudents() {
    this.filteredStudents = this.students.filter(
      (student) => student.className === this.selectedClass,
    );
  }

  onStudentDelete(student: Student) {
    this.selectedStudent = student;
    this.selectedStudent.status = StudentStatus.INACTIVE;
  }

  onStudentReactivate(student: Student) {
    this.selectedStudent = student;
    this.selectedStudent.status = StudentStatus.ACTIVE;
  }

  saveStudents(): void {
    //TODO implement
    console.log('Saved students');
    this.router.navigate(['students']);

    // this.studentsService.saveStudents(this.students).pipe(take(1)).subscribe(() => {
    //   // this.toaster.success(this.translate.instant('TOASTER.SAVED'));
    //   this.router.navigate(['students']);
    // });
  }
}
