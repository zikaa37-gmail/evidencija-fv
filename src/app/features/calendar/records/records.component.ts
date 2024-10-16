import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GlobalService } from 'src/app/shared/services/global.service';
import { Student } from '../../students/students.interface';
import { RecordsModalComponent } from './records-modal/records-modal.component';
import { NOTETYPE, Record } from './records.interface';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { OptionsComponent } from 'src/app/shared/components/options/options.component';
import { RecordsService } from './records.service';
@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatDividerModule,
    NgbPopoverModule,
    OptionsComponent,
  ],
})
export class RecordsComponent {
  private recordsService = inject(RecordsService);
  protected globalService = inject(GlobalService);
  private dialog = inject(MatDialog);
  protected record!: Record;
  selectedDate!: Date;
  protected options = this.recordsService.getOptions();
  protected students = this.recordsService.getStudents();
  // isMobile!: boolean;
  protected NOTETYPE = NOTETYPE;

  // constructor() {
  //   this.globalService.isMobile$.subscribe((x) => (this.isMobile = x));
  // }

  fetchSelectedOption(option: any) {
    console.log('selectedOption', option);
  }

  openNotesModal(type: string, student: Student) {
    const dialogRef = this.dialog.open(RecordsModalComponent, {
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
