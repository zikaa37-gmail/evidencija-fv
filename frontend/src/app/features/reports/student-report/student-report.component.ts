import { Component, computed, DestroyRef, effect, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { TranslatePipe } from '@ngx-translate/core';

import { environment } from '../../../../environments/environment';
import { LoaderService } from '../../../shared/components/loader/loader.service';
import { NoteListComponent } from '../../../shared/components/note-list/note-list.component';
import { ProfileHeaderComponent } from '../../../shared/components/profile-header/profile-header.component';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { WEEKDAYS } from '../../calendar/calendar.constants';
import { REPORT_COLUMNS, ReportRange, ReportRow, StudentReport } from '../reports.interface';

export interface StudentReportData {
  row: ReportRow;
  range: ReportRange;
}

@Component({
  selector: 'app-student-report',
  templateUrl: './student-report.component.html',
  styleUrl: './student-report.component.scss',
  imports: [DatePipe, TranslatePipe, MatTabGroup, MatTab, ProfileHeaderComponent, NoteListComponent],
})
export class StudentReportComponent {
  protected readonly dialogRef = inject(MatDialogRef<StudentReportComponent>);
  protected readonly data = inject<StudentReportData>(MAT_DIALOG_DATA);
  protected readonly columns = REPORT_COLUMNS;

  readonly #report = httpResource<StudentReport>(() => ({
    url: `${environment.apiUrl}/reports/student`,
    method: 'POST',
    body: { student_id: this.data.row.student_id, ...this.data.range },
  }));

  protected readonly report = computed(() =>
    this.#report.hasValue() ? (this.#report.value() ?? null) : null,
  );

  protected readonly records = computed(() =>
    (this.report()?.records ?? []).map((record) => {
      const [year, month, day] = record.date.split('-').map(Number);
      return { ...record, weekday: WEEKDAYS[(new Date(year, month - 1, day).getDay() + 6) % 7] };
    }),
  );

  constructor() {
    inject(DestroyRef).onDestroy(inject(LoaderService).watch(this.#report.isLoading));
    const errorHandler = inject(ErrorHandlerService);
    effect(() => {
      if (this.#report.error()) {
        errorHandler.notify('reportError');
      }
    });
  }
}
