import { Component, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { XlsxFileUploadComponent } from '../../../shared/components/xlsx-file-upload/xlsx-file-upload.component';
import { ListRowComponent } from '../../../shared/components/list-row/list-row.component';
import { RowAction, RowActionsComponent } from '../../../shared/components/row-actions/row-actions.component';
import { GlobalService } from '../../../shared/services/global.service';
import { openStudentDetails } from '../student-details/student-details.component';
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
      photo: null,
    },
  };
}

const DETAILS_ACTION: RowAction = { id: 'details', label: 'students.details', icon: 'info' };
const INCLUDED_ACTIONS = [
  DETAILS_ACTION,
  { id: 'exclude', label: 'students.exclude', icon: 'trash', danger: true },
];
const EXCLUDED_ACTIONS = [DETAILS_ACTION, { id: 'include', label: 'students.include', icon: 'restore' }];

@Component({
  selector: 'app-students-upload',
  templateUrl: './students-upload.component.html',
  styleUrl: './students-upload.component.scss',
  imports: [TranslatePipe, XlsxFileUploadComponent, ListRowComponent, RowActionsComponent],
})
export class StudentsUploadComponent {
  #studentsService = inject(StudentsService);
  #router = inject(Router);
  #dialog = inject(MatDialog);
  #globalService = inject(GlobalService);
  protected readonly StudentStatus = StudentStatus;

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

  actionsFor(student: Student): RowAction[] {
    return student.status === StudentStatus.ACTIVE ? INCLUDED_ACTIONS : EXCLUDED_ACTIONS;
  }

  onAction(student: Student, action: string): void {
    switch (action) {
      case 'details':
        openStudentDetails(this.#dialog, { student }, this.#globalService.isMobile());
        break;
      case 'exclude':
        this.#setStatus(student, StudentStatus.INACTIVE);
        break;
      case 'include':
        this.#setStatus(student, StudentStatus.ACTIVE);
        break;
    }
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
