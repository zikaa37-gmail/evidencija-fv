import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { REPORT_COLUMNS, ReportCounts } from '../reports.interface';

@Component({
  selector: 'app-report-stats',
  templateUrl: './report-stats.component.html',
  styleUrl: './report-stats.component.scss',
  imports: [TranslatePipe],
  host: { 'data-testid': 'report-stats' },
})
export class ReportStatsComponent {
  readonly counts = input.required<ReportCounts>();
  protected readonly columns = REPORT_COLUMNS;
}
