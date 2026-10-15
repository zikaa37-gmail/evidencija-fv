import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GlobalService } from 'src/app/shared/services/global.service';
import { Student } from '../../students/students.interface';
import { NOTE_TYPE, Record } from './records.interface';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { OptionsComponent } from 'src/app/features/calendar/records/options/options.component';
import { RecordsService } from './records.service';
import { StudentsService } from '../../students/students.service';
import { NotesModalComponent } from './notes-modal/notes-modal.component';
@Component({
    selector: 'app-records',
    templateUrl: './records.component.html',
    styleUrls: ['./records.component.scss'],
    imports: [
        CommonModule,
        TranslateModule,
        MatDividerModule,
        NgbPopoverModule,
    ]
})
export class RecordsComponent implements OnInit {
  private recordsService = inject(RecordsService);
  protected studentsService = inject(StudentsService);
  protected globalService = inject(GlobalService);
  private dialog = inject(MatDialog);
  protected record!: Record;
  selectedDate!: Date;
  // protected options = this.recordsService.options();
  protected NOTE_TYPE = NOTE_TYPE;

  ngOnInit() {
    this.studentsService.getStudentsByClassName();
    console.log('students', this.studentsService.filteredStudents());
  }

  fetchSelectedOption(option: any) {
    console.log('selectedOption', option);
  }

  openNotesModal(type: string, student: Student) {
    const dialogRef = this.dialog.open(NotesModalComponent, {
      height: 'auto',
      width: this.globalService.isMobile() ? '100vw' : '600px',
      maxWidth: '100vw',
      panelClass: 'user-dialog',
      disableClose: true,
    });

    dialogRef.componentInstance.type = type;
    dialogRef.componentInstance.student = student;
  }

  openModal(student: Student) {
    const dialogRef = this.dialog.open(OptionsComponent, {
      height: 'auto',
      width: '300px',
      // maxWidth: '200px',
      panelClass: 'user-dialog',
      disableClose: true,
    });
  }

  closeModal() {
    this.dialog.closeAll();
  }
}
