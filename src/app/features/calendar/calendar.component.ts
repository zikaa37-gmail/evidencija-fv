import { Component, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ClassSelectorComponent } from '../../shared/class-selector/class-selector.component';
import { GlobalService } from '../../shared/services/global.service';
import { CalendarBodyComponent } from './calendar-body/calendar-body.component';
import { MONTHS, MonthAction, WEEKDAYS } from './calendar.constants';
import { MonthSelectorComponent } from './month-selector/month-selector.component';
import {
  RecordsComponent,
  RecordsDialogData,
} from './records/records.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  imports: [ClassSelectorComponent, MonthSelectorComponent, CalendarBodyComponent],
})
export class CalendarComponent {
  #globalService = inject(GlobalService);
  #dialog = inject(MatDialog);

  protected readonly days = WEEKDAYS;
  protected readonly visibleMonth = signal(this.#firstOfMonth(new Date()));
  protected readonly selectedDate = signal(new Date());

  protected readonly monthName = computed(
    () => MONTHS[this.visibleMonth().getMonth()],
  );
  protected readonly year = computed(() => this.visibleMonth().getFullYear());

  protected readonly dates = computed(() => {
    const month = this.visibleMonth();
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
    const mondayBasedOffset = (month.getDay() + 6) % 7;

    return [
      ...Array<null>(mondayBasedOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  });

  protected readonly selectedDay = computed(() => {
    const selected = this.selectedDate();
    const month = this.visibleMonth();
    const isVisible =
      selected.getFullYear() === month.getFullYear() &&
      selected.getMonth() === month.getMonth();
    return isVisible ? selected.getDate() : null;
  });

  onMonthChange(action: MonthAction): void {
    this.visibleMonth.update(
      (month) =>
        new Date(
          month.getFullYear(),
          month.getMonth() + (action === 'prev' ? -1 : 1),
          1,
        ),
    );
  }

  onDateSelect(day: number): void {
    const month = this.visibleMonth();
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    this.selectedDate.set(date);
    this.#openRecords(date);
  }

  #openRecords(date: Date): void {
    this.#dialog.open<RecordsComponent, RecordsDialogData>(RecordsComponent, {
      data: { date },
      height: 'auto',
      width: this.#globalService.isMobile() ? '100vw' : '600px',
      maxWidth: '100vw',
      panelClass: 'user-dialog',
      disableClose: true,
    });
  }

  #firstOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
}
