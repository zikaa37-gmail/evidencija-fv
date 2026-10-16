import { Component, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ClassSelectorComponent } from '../../shared/class-selector/class-selector.component';
import { GlobalService } from '../../shared/services/global.service';
import { CalendarBodyComponent } from './calendar-body/calendar-body.component';
import { MONTHS, MonthAction, WEEKDAYS } from './calendar.constants';
import { buildMonthGrid } from './month-grid';
import { MonthSelectorComponent } from './month-selector/month-selector.component';
import {
  RecordsComponent,
  RecordsDialogData,
} from './records/records.component';
import { RecordsService } from './records/records.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  imports: [ClassSelectorComponent, MonthSelectorComponent, CalendarBodyComponent],
})
export class CalendarComponent {
  #globalService = inject(GlobalService);
  #dialog = inject(MatDialog);
  protected readonly recordsService = inject(RecordsService);

  protected readonly days = WEEKDAYS;
  protected readonly selectedDate = signal(new Date());

  protected readonly monthName = computed(
    () => MONTHS[this.recordsService.month().getMonth()],
  );
  protected readonly year = computed(() => this.recordsService.month().getFullYear());

  protected readonly dates = computed(() =>
    buildMonthGrid(this.recordsService.month()),
  );

  protected readonly selectedDay = computed(() => {
    const selected = this.selectedDate();
    const month = this.recordsService.month();
    const isVisible =
      selected.getFullYear() === month.getFullYear() &&
      selected.getMonth() === month.getMonth();
    return isVisible ? selected.getDate() : null;
  });

  protected readonly lastSelectableDay = computed(() => {
    const month = this.recordsService.month();
    const today = new Date();
    const monthIndex = month.getFullYear() * 12 + month.getMonth();
    const todayIndex = today.getFullYear() * 12 + today.getMonth();
    if (monthIndex < todayIndex) {
      return null;
    }
    return monthIndex === todayIndex ? today.getDate() : 0;
  });

  protected readonly readOnlyDays = computed(() => {
    const month = this.recordsService.month();
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const readOnly = new Set<number>();
    for (let day = 1; day <= days; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      if (date < new Date() && !this.recordsService.isEditable(date)) {
        readOnly.add(day);
      }
    }
    return readOnly;
  });

  onMonthChange(action: MonthAction): void {
    this.recordsService.month.update(
      (month) =>
        new Date(
          month.getFullYear(),
          month.getMonth() + (action === 'prev' ? -1 : 1),
          1,
        ),
    );
  }

  onDateSelect(day: number): void {
    const month = this.recordsService.month();
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    this.selectedDate.set(date);
    this.#dialog.open<RecordsComponent, RecordsDialogData>(RecordsComponent, {
      data: { date },
      height: 'auto',
      width: this.#globalService.isMobile() ? '100vw' : '600px',
      maxWidth: '100vw',
      panelClass: 'user-dialog',
      disableClose: true,
    });
  }
}
