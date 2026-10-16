import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { REPORT_COLUMNS, ReportCounts } from '../reports.interface';

@Component({
  selector: 'app-report-counts',
  templateUrl: './report-counts.component.html',
  styleUrl: './report-counts.component.scss',
  imports: [TranslatePipe],
  host: { class: 'chips', 'data-testid': 'report-counts' },
})
export class ReportCountsComponent {
  readonly counts = input.required<ReportCounts>();
  protected readonly columns = REPORT_COLUMNS;
}
