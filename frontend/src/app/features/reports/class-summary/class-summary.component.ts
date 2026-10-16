import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as XLSX from 'xlsx';

import { SchoolYearService } from '../../../core/school-year/school-year.service';
import { ClassSelectorComponent } from '../../../shared/class-selector/class-selector.component';
import { ReportFiltersComponent } from '../report-filters/report-filters.component';
import { ClassReport, REPORT_COLUMNS } from '../reports.interface';
import { ReportsService } from '../reports.service';

@Component({
  selector: 'app-class-summary',
  templateUrl: './class-summary.component.html',
  styleUrl: './class-summary.component.scss',
  imports: [
    DatePipe,
    TranslatePipe,
    RouterLink,
    MatButton,
    ClassSelectorComponent,
    ReportFiltersComponent,
  ],
})
export class ClassSummaryComponent {
  #translate = inject(TranslateService);
  protected readonly reports = inject(ReportsService);
  protected readonly schoolYear = inject(SchoolYearService).current;
  protected readonly columns = REPORT_COLUMNS;
  protected readonly printedOn = new Date();

  print(): void {
    window.print();
  }

  exportToExcel(report: ClassReport): void {
    const t = (key: string) => this.#translate.instant(key);
    const rows = report.students.map((row) => ({
      [t('students.lastName')]: row.last_name,
      [t('students.firstName')]: row.first_name,
      ...Object.fromEntries(REPORT_COLUMNS.map((column) => [t(`options.${column}`), row[column]])),
      [t('reports.total')]: row.total,
      [t('reports.praises')]: row.praises,
      [t('reports.warnings')]: row.warnings,
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), report.class_name);
    XLSX.writeFile(workbook, `izvestaj-${report.class_name}-${report.from}-${report.to}.xlsx`);
  }
}
