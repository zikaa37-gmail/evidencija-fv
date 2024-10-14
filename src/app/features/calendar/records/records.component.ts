import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GlobalService } from 'src/app/shared/services/global.service';
import { Student } from '../../students/students.interface';
import { NOTETYPE } from './records-modal/recodrs-modal.constants';
import { RecordsModalComponent } from './records-modal/records-modal.component';
import { RecordsHelperService } from './records.helper.service';
import { Record } from './records.interface';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss']
})
export class RecordsComponent implements OnInit {
  record!: Record;
  selectedDate!: Date;
  options = this.helper.getOptions();
  students = this.helper.getStudents();
  isMobile!: boolean;
  public NOTETYPE = NOTETYPE;

  constructor(
    private helper: RecordsHelperService,
    public globalService: GlobalService,
    private dialog: MatDialog
  ) { this.globalService.isMobile$.subscribe(x => this.isMobile = x) }

  ngOnInit(): void {
  }

  fetchSelectedOption(option: any) {
    console.log('selectedOption', option);
  }

  openModal(type: string, student: Student) {
    const dialogRef = this.dialog.open(RecordsModalComponent, {
      height: 'auto',
      width: this.isMobile ? '100vw' : '600px',
      maxWidth: '100vw',
      panelClass: 'user-dialog',
      disableClose: true
    });

    dialogRef.componentInstance.type = type;
    dialogRef.componentInstance.student = student;
  }

  closeModal() {
    this.dialog.closeAll();
  }
}
