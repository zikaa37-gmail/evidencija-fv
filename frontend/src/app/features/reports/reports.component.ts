import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { MatButton } from '@angular/material/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as XLSX from 'xlsx';

import { environment } from '../../../environments/environment';
import { SchoolYearService } from '../../core/school-year/school-year.service';
import { ClassSelectorComponent } from '../../shared/class-selector/class-selector.component';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { MONTHS } from '../calendar/calendar.constants';
import { toIsoDate } from '../calendar/records/records.interface';
import { ClassesService } from '../classes/classes.service';

type Period = 'month' | 'first-term' | 'second-term' | 'year';

interface ReportRow {
  student_id: number;
  first_name: string;
  last_name: string;
  status: 'active' | 'inactive';
  absent: number;
  equipment: number;
  pity: number;
  late: number;
  ill: number;
  total: number;
  praises: number;
  warnings: number;
}

interface ClassReport {
  class_name: string;
  from: string;
  to: string;
  students: ReportRow[];
}

export const REPORT_COLUMNS = ['absent', 'equipment', 'pity', 'late', 'ill'] as const;

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  imports: [DatePipe, TranslatePipe, MatButton, ClassSelectorComponent],
})
export class ReportsComponent {
  #classesService = inject(ClassesService);
  #schoolYearService = inject(SchoolYearService);
  #translate = inject(TranslateService);

  protected readonly columns = REPORT_COLUMNS;
  protected readonly periods: Period[] = ['month', 'first-term', 'second-term', 'year'];
  protected readonly period = signal<Period>('month');
  protected readonly selectedMonth = signal(toIsoDate(new Date()).slice(0, 7));

  protected readonly months = computed(() => {
    const schoolYear = this.#schoolYearService.current();
    if (!schoolYear) {
      return [];
    }
    const start = parseDate(schoolYear.starts_on);
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
      return { value: toIsoDate(date).slice(0, 7), name: MONTHS[date.getMonth()], year: date.getFullYear() };
    });
  });

  readonly #range = computed(() => {
    const schoolYear = this.#schoolYearService.current();
    if (!schoolYear) {
      return null;
    }
    const startYear = parseDate(schoolYear.starts_on).getFullYear();
    switch (this.period()) {
      case 'month': {
        const [year, month] = this.selectedMonth().split('-').map(Number);
        return { from: toIsoDate(new Date(year, month - 1, 1)), to: toIsoDate(new Date(year, month, 0)) };
      }
      case 'first-term':
        return { from: schoolYear.starts_on, to: `${startYear}-12-31` };
      case 'second-term':
        return { from: `${startYear + 1}-01-01`, to: schoolYear.ends_on };
      default:
        return { from: schoolYear.starts_on, to: schoolYear.ends_on };
    }
  });

  readonly #classId = computed(
    () =>
      this.#classesService
        .classes()
        .find((item) => item.name === this.#classesService.selectedClass())?.id ?? null,
  );

  protected readonly report = httpResource<ClassReport>(() => {
    const range = this.#range();
    const classId = this.#classId();
    return range && classId !== null
      ? {
          url: `${environment.apiUrl}/reports/class`,
          method: 'POST',
          body: { school_class_id: classId, ...range },
        }
      : undefined;
  });

  protected readonly totals = computed(() => {
    const rows = this.report.hasValue() ? (this.report.value()?.students ?? []) : [];
    const sum = (key: keyof ReportRow) => rows.reduce((acc, row) => acc + Number(row[key]), 0);
    return {
      ...Object.fromEntries(REPORT_COLUMNS.map((column) => [column, sum(column)])),
      total: sum('total'),
      praises: sum('praises'),
      warnings: sum('warnings'),
    } as Record<string, number>;
  });

  constructor() {
    inject(DestroyRef).onDestroy(inject(LoaderService).watch(this.report.isLoading));
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
