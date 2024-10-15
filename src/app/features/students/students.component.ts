import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
// import { ToastrService } from 'ngx-toastr';
import { sections } from '../calendar/calendar.service';
import { Section, Student } from './students.interface';
import { StudentsService } from './students.service';
import { CommonModule } from '@angular/common';
import { CardComponent } from 'src/app/shared/components/card/card.component';
import { DepartmentSelectorComponent } from 'src/app/shared/department-selector/department-selector.component';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    CardComponent,
    DepartmentSelectorComponent,
  ],
})
export class StudentsComponent implements OnInit {
  // private toaster = inject(ToastrService);
  // private translate = inject(TranslateService);
  private router = inject(Router);
  studentsService = inject(StudentsService);
  // students$ = this.studentsService.students(); //.getStudents();
  // filteredStudents$ = this.studentsService.filteredStudents$; //: Student[] = [];
  sections$ = sections();
  // TODO
  // sections$ = this.studentsService.sections$;
  selectedSection: Section = {
    grade: '5',
    department: '1',
  };
  selectedStudent: Student | null = null;

  ngOnInit(): void {
    // this.studentsService.getSections(); //.subscribe();
    this.studentsService.getAllStudents(); //.subscribe();
  }

  setSelectedSection(grade: string, department: string) {
    this.studentsService.setSelectedSection(grade, department);
  }

  onSectionChange(section: any) {
    this.selectedSection = section;
    this.setSelectedSection(
      this.selectedSection.grade,
      this.selectedSection.department,
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

  gotoUpload() {
    this.router.navigate(['students/upload']);
  }
  // saveStudents() {
  //   this.studentsService.saveStudents(this.students).subscribe(() => {
  //     this.toaster.success(
  //       this.translate.instant('TOASTER.SAVED'),
  //     );
  //     // this.router.navigate(['students']);
  //   })
  // }
}
