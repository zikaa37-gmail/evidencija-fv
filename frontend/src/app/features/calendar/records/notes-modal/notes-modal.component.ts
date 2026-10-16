import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { Student } from '../../../students/students.interface';
import { NOTE_TYPE, NoteType, StudentNote } from '../records.interface';
import { RecordsService } from '../records.service';

export interface NotesModalData {
  type: NoteType;
  student: Student;
  date: string;
}

@Component({
  selector: 'app-notes-modal',
  templateUrl: './notes-modal.component.html',
  styleUrl: './notes-modal.component.scss',
  imports: [TranslatePipe, MatButton],
})
export class NotesModalComponent {
  #dialogRef = inject(MatDialogRef<NotesModalComponent, StudentNote>);
  #recordsService = inject(RecordsService);
  readonly #data = inject<NotesModalData>(MAT_DIALOG_DATA);
  protected readonly NOTE_TYPE = NOTE_TYPE;
  protected readonly student = this.#data.student;
  protected readonly type = signal<NoteType>(this.#data.type);
  protected readonly text = signal('');
  protected readonly saving = signal(false);

  addNote(): void {
    if (!this.text().trim()) {
      return;
    }
    this.saving.set(true);
    this.#recordsService
      .addNote({ student: this.student, date: this.#data.date, type: this.type(), text: this.text() })
      .subscribe({
        next: (note) => this.#dialogRef.close(note),
        error: () => this.saving.set(false),
      });
  }

  closeModal(): void {
    this.#dialogRef.close();
  }
}
