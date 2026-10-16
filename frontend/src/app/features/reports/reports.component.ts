import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { ClassSelectorComponent } from '../../shared/class-selector/class-selector.component';
import { ListRowComponent } from '../../shared/components/list-row/list-row.component';
import { RowAction, RowActionsComponent } from '../../shared/components/row-actions/row-actions.component';
import { GlobalService } from '../../shared/services/global.service';
import { ReportFiltersComponent } from './report-filters/report-filters.component';
import { ReportCountsComponent } from './report-counts/report-counts.component';
import { ReportRow } from './reports.interface';
import { ReportsService } from './reports.service';
import { openStudentReport } from './student-report/student-report.component';

const ROW_ACTIONS: RowAction[] = [{ id: 'preview', label: 'reports.preview', icon: 'eye' }];

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  imports: [
    DatePipe,
    TranslatePipe,
    RouterLink,
    MatButton,
    ClassSelectorComponent,
    ListRowComponent,
    RowActionsComponent,
    ReportFiltersComponent,
    ReportCountsComponent,
  ],
})
export class ReportsComponent {
  #dialog = inject(MatDialog);
  #globalService = inject(GlobalService);
  protected readonly reports = inject(ReportsService);
  protected readonly actions = ROW_ACTIONS;

  openPreview(row: ReportRow): void {
    const range = this.reports.range();
    if (range) {
      openStudentReport(this.#dialog, { row, range }, this.#globalService.isMobile());
    }
  }
}
