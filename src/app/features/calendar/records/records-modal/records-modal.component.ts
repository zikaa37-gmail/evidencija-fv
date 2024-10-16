import { Component, inject, Inject, Input, input, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Student } from '../../../students/students.interface';
import { Note, NOTETYPE } from '../records.interface';
import { RecordsService } from '../records.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-records-modal',
  templateUrl: './records-modal.component.html',
  styleUrls: ['./records-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, MatButtonModule],
})
export class RecordsModalComponent {
  private recordsService = inject(RecordsService);
  private dialogRef = inject(MatDialogRef<RecordsModalComponent>);
  public NOTETYPE = NOTETYPE;
  // type = input<string>(NOTETYPE.BAD); // signal<string>(NOTETYPE.BAD);
  @Input() type = NOTETYPE.BAD;
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
