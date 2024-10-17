import { Component, inject, OnInit } from '@angular/core';
import { CalendarService, sections } from '../../calendar/calendar.service';
import { Section, Student } from '../students.interface';
import { StudentsService } from '../students.service';
// import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { XlsxFileUploadComponent } from 'src/app/shared/components/xlsx-file-upload/xlsx-file-upload.component';
import { DepartmentSelectorComponent } from 'src/app/shared/department-selector/department-selector.component';
import { CardComponent } from 'src/app/shared/components/card/card.component';

@Component({
  selector: 'app-students-upload',
  templateUrl: './students-upload.component.html',
  styleUrls: ['./students-upload.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DepartmentSelectorComponent,
    CardComponent,
    XlsxFileUploadComponent,
  ],
})
export class StudentsUploadComponent {
  private studentsService = inject(StudentsService);
  // private toaster = inject(ToastrService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private calendarService = inject(CalendarService);
  students: Student[] = [];
  filteredStudents: Student[] = [];
  sections$ = sections();
  // TODO
  // sections$ = this.studentsService.sections$;
  selectedSection: Section = {
    grade: '5',
    department: '1',
  };
  selectedStudent: Student | null = null;

  mapData(data: any) {
    for (let i = 0; i < data.length; i++) {
      const dataRow: any[] = data[i];

      for (let x = 0; x < dataRow.length; x++) {
        const row = dataRow[x];
        const student = this.studentsService.mapStudentFromExcelData(row);
        if (i === 0) {
          this.selectedSection.grade = student.section.grade.toString();
          this.selectedSection.department =
            student.section.department.toString();
        }
        this.students.push(student);
      }
    }
    this.filterStudents();
  }

  setSelectedSection(grade: string, department: string) {
    this.selectedSection.grade = grade;
    this.selectedSection.department = department;
    this.filterStudents();
  }

  onSectionChange(section: any) {
    this.setSelectedSection(section.grade, section.department);
    //  = section;
    // console.log(this.section);
  }

  filterStudents() {
    this.filteredStudents = this.students.filter(
      (student) =>
        student.section.grade === this.selectedSection.grade &&
        student.section.department === this.selectedSection.department,
    );
  }

  onStudentDelete(student: Student) {
    this.selectedStudent = student;
    this.selectedStudent.status = 'inactive';
  }

  onStudentPublish(student: Student) {
    this.selectedStudent = student;
    this.selectedStudent.status = 'active';
  }

  saveStudents(): void {
    //TODO implement
    console.log('Saved students');
    this.router.navigate(['students']);

    // this.studentsService.saveStudents(this.students).subscribe(() => {
    //   // this.toaster.success(this.translate.instant('TOASTER.SAVED'));
    //   this.router.navigate(['students']);
    // });
  }
}
