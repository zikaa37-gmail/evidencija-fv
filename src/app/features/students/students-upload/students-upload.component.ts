import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { XlsxFileUploadComponent } from '../../../shared/components/xlsx-file-upload/xlsx-file-upload.component';
import { ClassSelectorComponent } from '../../../shared/class-selector/class-selector.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ClassesService } from '../../classes/classes.service';
import { Student, StudentStatus } from '../students.interface';
import { StudentsService } from '../students.service';

@Component({
  selector: 'app-students-upload',
  templateUrl: './students-upload.component.html',
  styleUrl: './students-upload.component.scss',
  imports: [
    TranslatePipe,
    ClassSelectorComponent,
    XlsxFileUploadComponent,
    CardComponent,
  ],
})
export class StudentsUploadComponent {
  #studentsService = inject(StudentsService);
  #classesService = inject(ClassesService);
  #router = inject(Router);

  protected readonly students = signal<Student[]>([]);
  protected readonly filteredStudents = computed(() =>
    this.students().filter(
      (student) => student.className === this.#classesService.selectedClass(),
    ),
  );

  mapData(sheets: unknown[][][]): void {
    const imported = sheets.flatMap((rows) =>
      rows.map((row) => this.#studentsService.mapStudentFromExcelData(row)),
    );
    this.students.set(imported);
    if (imported.length) {
      this.#classesService.setSelectedClass(imported[0].className);
    }
  }

  onStudentDelete(student: Student): void {
    this.#setStatus(student, StudentStatus.INACTIVE);
  }

  onStudentReactivate(student: Student): void {
    this.#setStatus(student, StudentStatus.ACTIVE);
  }

  saveStudents(): void {
    this.#studentsService
      .saveStudents(this.students())
      .subscribe(() => this.#router.navigate(['students']));
  }

  #setStatus(student: Student, status: StudentStatus): void {
    this.students.update((students) =>
      students.map((s) => (s === student ? { ...s, status } : s)),
    );
  }
}
