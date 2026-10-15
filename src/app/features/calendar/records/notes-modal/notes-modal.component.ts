import { Component, inject, Inject, Input, input, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Student } from '../../../students/students.interface';
import { Note, NOTE_TYPE } from '../records.interface';
import { RecordsService } from '../records.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-notes-modal',
    templateUrl: './notes-modal.component.html',
    styleUrls: ['./notes-modal.component.scss'],
    imports: [CommonModule, TranslateModule, FormsModule, MatButtonModule]
})
export class NotesModalComponent {
  private recordsService = inject(RecordsService);
  private dialogRef = inject(MatDialogRef<NotesModalComponent>);
  public NOTE_TYPE = NOTE_TYPE;
  // type = input<string>(NOTETYPE.BAD); // signal<string>(NOTETYPE.BAD);
  @Input() type = NOTE_TYPE.BAD;
  student!: Student;
  note: Note = {
    student: this.student,
    note: '',
    type: this.type,
  };

  addNote() {
    console.log('SAVED');
    this.closeModal();
    // this.recordsService.addNote(this.note, this.type())
    //   .subscribe(note => this.closeModal());
  }

  setType(type: string) {
    this.type = type;
  }

  closeModal() {
    this.dialogRef.close(null);
  }
}
