import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { GlobalService } from 'src/app/shared/services/global.service';
import { RecordsComponent } from './records/records.component';
import { Section } from '../students/students.interface';
import { CalendarService, sections } from './calendar.service';
import { CalendarType } from './calendar.interface';
import { CommonModule } from '@angular/common';
import { DepartmentSelectorComponent } from 'src/app/shared/department-selector/department-selector.component';
import { MonthSelectorComponent } from './month-selector/month-selector.component';
import { CalendarBodyComponent } from './calendar-body/calendar-body.component';
import { StudentsService } from '../students/students.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DepartmentSelectorComponent,
    MonthSelectorComponent,
    CalendarBodyComponent,
  ],
})
export class CalendarComponent {
  protected studentsService = inject(StudentsService);
  private calendarService = inject(CalendarService);
  private globalService = inject(GlobalService);
  private dialog = inject(MatDialog);
  sections = sections();

  today = new Date();
  calendarType: CalendarType = CalendarType.MONTH;

  selectedMonthIndex = this.today.getMonth();
  selectedMonth = this.calendarService.getMonth(this.selectedMonthIndex);

  selectedYearIndex = new Date().getFullYear();
  selectedYear = new Date().getFullYear().toString();
  firstOfTheMonth = this.setFistDayOfTheMonth();
  numberOfDaysInMonth = this.getNumberOfDaysInMonth();

  days = this.calendarService.getDays();
  dates = this.setDatesOfMonth();
  selectedDate = this.today.getDate().toString();
  selectedDateName = moment(this.today).format('dddd');
  section!: Section;

  onMonthChange(action: any) {
    if (action === 'prev') {
      this.selectedMonthIndex--;
      if (this.selectedMonthIndex < 0) {
        this.selectedMonthIndex += 11;

        this.selectedYearIndex--;
        this.selectedYear = this.selectedYearIndex.toString();
      }
    } else {
      this.selectedMonthIndex++;
      if (this.selectedMonthIndex > 11) {
        this.selectedMonthIndex = 0;

        this.selectedYearIndex++;
        this.selectedYear = this.selectedYearIndex.toString();
      }
    }
    this.setSelectedMonth(this.selectedMonthIndex);
    this.firstOfTheMonth = this.setFistDayOfTheMonth();
    this.numberOfDaysInMonth = this.getNumberOfDaysInMonth();
    this.setDatesOfMonth();

    // console.log('Selected Month Index:', this.selectedMonthIndex);
    // console.log('Selected Year Index:', this.selectedYearIndex);
    // console.log('Number of Days in Month:', this.numberOfDaysInMonth);
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
    const dates = [];

    for (let i = 1; i <= this.numberOfDaysInMonth; i++) {
      dates.push(i.toString());
    }

    const dt = moment(this.firstOfTheMonth); //, 'YYYY-MM-DD HH:mm:ss'
    const weekday = dt.day();

    for (let i = 0; i < weekday; i++) {
      dates.unshift('');
    }

    this.dates = dates;
    // console.log('Dates', this.dates);
    return dates;
  }

  getNumberOfDaysInMonth(): number {
    return moment(this.firstOfTheMonth).daysInMonth();
  }

  setSelectedMonth(monthIndex: number) {
    this.selectedMonth = this.calendarService.getMonth(monthIndex);
  }

  openModal() {
    const dialogRef = this.dialog.open(RecordsComponent, {
      height: 'auto',
      width: this.globalService.isMobile() ? '100vw' : '600px',
      maxWidth: '100vw',
      panelClass: 'user-dialog',
      disableClose: true,
    });

    dialogRef.componentInstance.selectedDate = new Date(
      `${this.selectedYear}-${this.selectedMonth}-${this.selectedDate}`,
    );
  }
}
