import { Component, inject } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { NoteListComponent, NoteListItem } from '../../../shared/components/note-list/note-list.component';
import { ProfileHeaderComponent } from '../../../shared/components/profile-header/profile-header.component';
import { Student } from '../students.interface';

export interface StudentDetailsData {
  student: Student;
  notes?: NoteListItem[];
}

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrl: './student-details.component.scss',
  imports: [LowerCasePipe, TranslatePipe, ProfileHeaderComponent, NoteListComponent],
})
export class StudentDetailsComponent {
  protected readonly dialogRef = inject(MatDialogRef<StudentDetailsComponent>);
  protected readonly data = inject<StudentDetailsData>(MAT_DIALOG_DATA);
  protected readonly student = this.data.student;
}

export function openStudentDetails(dialog: MatDialog, data: StudentDetailsData, mobile: boolean): void {
  dialog.open<StudentDetailsComponent, StudentDetailsData>(StudentDetailsComponent, {
    data,
    width: mobile ? '100vw' : '480px',
    maxWidth: '100vw',
    panelClass: 'user-dialog',
    autoFocus: false,
  });
}
