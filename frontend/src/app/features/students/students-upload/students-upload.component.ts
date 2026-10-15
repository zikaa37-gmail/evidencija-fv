import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { XlsxFileUploadComponent } from '../../../shared/components/xlsx-file-upload/xlsx-file-upload.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { Student, StudentImportRow, StudentStatus } from '../students.interface';
import { StudentsService } from '../students.service';

interface PreviewRow {
  row: StudentImportRow;
  student: Student;
}

function toPreview(row: StudentImportRow, index: number): PreviewRow {
  return {
    row,
    student: {
      ...row,
      id: -(index + 1),
      status: StudentStatus.ACTIVE,
      school_class_id: 0,
      head_teacher_name: null,
      head_teacher_phone: null,
    },
  };
}

@Component({
  selector: 'app-students-upload',
  templateUrl: './students-upload.component.html',
  styleUrl: './students-upload.component.scss',
  imports: [TranslatePipe, XlsxFileUploadComponent, CardComponent],
})
export class StudentsUploadComponent {
  #studentsService = inject(StudentsService);
  #router = inject(Router);

  protected readonly preview = signal<PreviewRow[]>([]);
  protected readonly skippedRows = signal(0);
  protected readonly selectedClass = signal<string | null>(null);

  protected readonly classNames = computed(() =>
    [...new Set(this.preview().map((item) => item.row.class_name))].sort(
      (a, b) => a.localeCompare(b, 'sr', { numeric: true }),
    ),
  );

  protected readonly visible = computed(() =>
    this.preview().filter((item) => item.row.class_name === this.selectedClass()),
  );

  protected readonly activeCount = computed(
    () =>
      this.preview().filter((item) => item.student.status === StudentStatus.ACTIVE)
        .length,
  );

  mapData(sheets: unknown[][][]): void {
    const rows = sheets.flat();
    const parsed = rows
      .map((row) => this.#studentsService.parseExcelRow(row))
      .filter((row): row is StudentImportRow => row !== null);

    this.skippedRows.set(rows.filter((row) => row.some((cell) => cell != null && String(cell).trim())).length - parsed.length);
    this.preview.set(parsed.map(toPreview));
    this.selectedClass.set(this.classNames()[0] ?? null);
  }

  onStudentDelete(student: Student): void {
    this.#setStatus(student, StudentStatus.INACTIVE);
  }

  onStudentReactivate(student: Student): void {
    this.#setStatus(student, StudentStatus.ACTIVE);
  }

  saveStudents(): void {
    const rows = this.preview()
      .filter((item) => item.student.status === StudentStatus.ACTIVE)
      .map((item) => item.row);

    this.#studentsService
      .import(rows)
      .subscribe({
        next: () => this.#router.navigate(['students']),
        error: () => undefined,
      });
  }

  #setStatus(student: Student, status: StudentStatus): void {
    this.preview.update((items) =>
      items.map((item) =>
        item.student.id === student.id
          ? { ...item, student: { ...item.student, status } }
          : item,
      ),
    );
  }
}
