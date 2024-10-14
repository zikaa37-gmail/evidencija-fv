import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Student } from '../../../students/students.interface';
import { Note } from '../records.interface';
import { RecordsService } from '../records.service';
import { NOTETYPE } from './recodrs-modal.constants';

@Component({
  selector: 'app-records-modal',
  templateUrl: './records-modal.component.html',
  styleUrls: ['./records-modal.component.scss']
})
export class RecordsModalComponent {
  public NOTETYPE = NOTETYPE;
  type = NOTETYPE.GOOD;
  student!: Student;
  note: Note = {
    student: this.student,
    note: '',
    type: this.type
  }

  constructor(
    private recordsService: RecordsService,
    private dialogRef: MatDialogRef<RecordsModalComponent>,
    // @Inject(MAT_DIALOG_DATA) data: any
  ) { }

  addNote() {
    console.log('SAVED');
    this.closeModal();
    // this.recordsService.addNote(this.note)
    //   .subscribe(note => this.closeModal());

  }

  setType(type: string) {
    this.type = type;
  }

  closeModal() {
    this.dialogRef.close(null);
  }
}
