import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { Student } from '../../../students/students.interface';
import { Note, NOTE_TYPE, NoteType } from '../records.interface';

export interface NotesModalData {
  type: NoteType;
  student: Student;
}

@Component({
  selector: 'app-notes-modal',
  templateUrl: './notes-modal.component.html',
  styleUrl: './notes-modal.component.scss',
  imports: [TranslatePipe, MatButton],
})
export class NotesModalComponent {
  #dialogRef = inject(MatDialogRef<NotesModalComponent, Note>);
  readonly #data = inject<NotesModalData>(MAT_DIALOG_DATA);
  protected readonly NOTE_TYPE = NOTE_TYPE;
  protected readonly type = signal<NoteType>(this.#data.type);
  protected readonly text = signal('');

  addNote(): void {
    this.#dialogRef.close({
      student: this.#data.student,
      note: this.text(),
      type: this.type(),
    });
  }

  closeModal(): void {
    this.#dialogRef.close();
  }
}
