import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { GlobalService } from 'src/app/shared/services/global.service';
import { RecordsComponent } from './records/records.component';
import { Section } from '../students/students.interface';
import { CalendarHelperService } from './calendar.helper.service';
import { CalendarType } from './calendar.interface';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  sections = this.helper.getSections();

  today = new Date();
  calendarType: CalendarType = CalendarType.MONTH;

  selectedMonthIndex = this.today.getMonth();
  selectedMonth = this.helper.getMonth(this.selectedMonthIndex);

  selectedYearIndex = new Date().getFullYear();
  selectedYear = new Date().getFullYear().toString();
  firstOfTheMonth = this.setFistDayOfTheMonth();
  numberOfDaysInMonth = this.getNumberOfDaysInMonth();

  days = this.helper.getDays();
  dates = this.setDatesOfMonth();
  selectedDate = this.today.getDate().toString();
  selectedDateName = moment(this.today).format('dddd');
  section!: Section;
  isMobile = this.globalService.isMobileSubject.getValue();

  constructor(
    private helper: CalendarHelperService,
    private globalService: GlobalService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {

  }

  onMonthChange(action: any) {
    if (action === 'prev') {
      this.selectedMonthIndex -= 1;
      if (this.selectedMonthIndex < 0) {
        this.selectedMonthIndex += 12;

        this.selectedYearIndex -= 1;
        this.selectedYear = this.selectedYearIndex.toString();
      }
    } else {
      this.selectedMonthIndex += 1;
      if (this.selectedMonthIndex > 11) {
        this.selectedMonthIndex -= 12;

        this.selectedYearIndex += 1;
        this.selectedYear = this.selectedYearIndex.toString();
      }
    }
    this.getSelectedMonth(this.selectedMonthIndex);
    this.firstOfTheMonth = this.setFistDayOfTheMonth();
    this.numberOfDaysInMonth = this.getNumberOfDaysInMonth();
    this.setDatesOfMonth();
  }

  onDateSelect(date: string) {
    this.selectedDate = date;
    this.openModal();
  }

  onSectionChange(section: any) {
    this.section = section;
    console.log(this.section);
  }

  setFistDayOfTheMonth(): Date {
    return new Date(`${this.selectedYear}-${this.selectedMonth}-01`);
  }

  setDatesOfMonth(): string[] {
    this.dates = [];
    let dates = [];

    for (let i = 1; i <= this.numberOfDaysInMonth; i++) {
      dates.push(i.toString());
    }
    const dt = moment(this.firstOfTheMonth, "YYYY-MM-DD HH:mm:ss");
    const weekday = dt.weekday();
    for (let i = 1; i <= weekday; i++) {
      dates.unshift('');
    }

    this.dates = dates;
    return dates;
  }

  getNumberOfDaysInMonth(): number {
    return moment(this.firstOfTheMonth).daysInMonth();
  }

  getSelectedMonth(monthIndex: number) {
    this.selectedMonth = this.helper.getMonth(monthIndex);
  }



  openModal() {
    const dialogRef = this.dialog.open(RecordsComponent, {
      height: 'auto',
      width: this.isMobile ? '100vw' : '600px',
      maxWidth: '100vw',
      panelClass: 'user-dialog',
      disableClose: true
    });

    dialogRef.componentInstance.selectedDate = new Date(`${this.selectedYear}-${this.selectedMonth}-${this.selectedDate}`);
  }

}
