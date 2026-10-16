import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ReportsService } from '../reports.service';

@Component({
  selector: 'app-report-filters',
  templateUrl: './report-filters.component.html',
  styleUrl: './report-filters.component.scss',
  imports: [TranslatePipe],
})
export class ReportFiltersComponent {
  protected readonly reports = inject(ReportsService);
}
