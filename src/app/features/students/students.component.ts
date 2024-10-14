import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CalendarHelperService } from '../calendar/calendar.helper.service';
import { Section, Student } from './students.interface';
import { StudentsService } from './students.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {
  students$ = this.studentsService.students$;//.getStudents();
  filteredStudents$ = this.studentsService.filteredStudents$;//: Student[] = [];
  sections$ = this.helper.getSections();
  // TODO
  // sections$ = this.studentsService.sections$;
  selectedSection: Section = {
    grade: '5',
    department: '1'
  };
  selectedStudent: Student | null = null;

  constructor(
    private studentsService: StudentsService,
    private toaster: ToastrService,
    private translate: TranslateService,
    private router: Router,
    private helper: CalendarHelperService, // TODO remove
  ) { }

  ngOnInit(): void {
    this.studentsService.getStudents().subscribe();
  }

  setSelectedSection(grade: string, department: string) {
    this.studentsService.setSelectedSection(grade, department);
  }

  onSectionChange(section: any) {
    this.selectedSection = section;
    this.setSelectedSection(this.selectedSection.grade, this.selectedSection.department);
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
    this.router.navigate(['students/upload'])
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
