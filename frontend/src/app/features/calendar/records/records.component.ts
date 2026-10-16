import { Component, computed, inject } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';

import { GlobalService } from '../../../shared/services/global.service';
import { Student, StudentStatus } from '../../students/students.interface';
import { StudentsService } from '../../students/students.service';
import {
  NotesModalComponent,
  NotesModalData,
} from './notes-modal/notes-modal.component';
import { OptionsComponent, OptionsDialogData } from './options/options.component';
import { NOTE_TYPE, NoteType, toIsoDate } from './records.interface';
import { RecordsService } from './records.service';

export interface RecordsDialogData {
  date: Date;
}

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrl: './records.component.scss',
  imports: [DatePipe, LowerCasePipe, TranslatePipe, MatDivider, NgbPopover],
})
export class RecordsComponent {
  #dialog = inject(MatDialog);
  #dialogRef = inject(MatDialogRef<RecordsComponent>);
  #globalService = inject(GlobalService);
  protected studentsService = inject(StudentsService);
  protected readonly data = inject<RecordsDialogData>(MAT_DIALOG_DATA);
  protected readonly recordsService = inject(RecordsService);
  protected readonly NOTE_TYPE = NOTE_TYPE;
  protected readonly dateIso = toIsoDate(this.data.date);
  protected readonly editable = this.recordsService.isEditable(this.data.date);
  protected readonly students = computed(() =>
    this.studentsService
      .filteredStudents()
      .filter((student) => student.status === StudentStatus.ACTIVE),
  );

  openNotesModal(type: NoteType, student: Student): void {
    this.#dialog.open<NotesModalComponent, NotesModalData>(
      NotesModalComponent,
      {
        data: { type, student, date: this.dateIso },
        height: 'auto',
        width: this.#globalService.isMobile() ? '100vw' : '600px',
        maxWidth: '100vw',
        panelClass: 'user-dialog',
        disableClose: true,
      },
    );
  }

  openOptions(student: Student): void {
    this.#dialog.open<OptionsComponent, OptionsDialogData>(OptionsComponent, {
      data: { student, date: this.dateIso },
      height: 'auto',
      width: '300px',
      panelClass: 'user-dialog',
      disableClose: true,
    });
  }

  closeModal(): void {
    this.#dialogRef.close();
  }
}
