import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { SchoolYearService } from '../../core/school-year/school-year.service';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { MONTHS } from '../calendar/calendar.constants';
import { toIsoDate } from '../calendar/records/records.interface';
import { ClassesService } from '../classes/classes.service';
import { ClassReport, Period, REPORT_COLUMNS, ReportCounts, ReportRange, ReportRow } from './reports.interface';

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

@Injectable()
export class ReportsService {
  #classesService = inject(ClassesService);
  #schoolYearService = inject(SchoolYearService);

  readonly periods: Period[] = ['month', 'first-term', 'second-term', 'year'];
  readonly period = signal<Period>('month');
  readonly selectedMonth = signal(toIsoDate(new Date()).slice(0, 7));

  readonly months = computed(() => {
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

  readonly range = computed<ReportRange | null>(() => {
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

  readonly #report = httpResource<ClassReport>(() => {
    const range = this.range();
    const classId = this.#classId();
    return range && classId !== null
      ? {
          url: `${environment.apiUrl}/reports/class`,
          method: 'POST',
          body: { school_class_id: classId, ...range },
        }
      : undefined;
  });

  readonly report = computed(() => (this.#report.hasValue() ? (this.#report.value() ?? null) : null));

  readonly ranking = computed(() =>
    [...(this.report()?.students ?? [])].sort(
      (a, b) => b.total - a.total || b.warnings - a.warnings || a.last_name.localeCompare(b.last_name, 'sr'),
    ),
  );

  readonly totals = computed<ReportCounts>(() => {
    const rows = this.report()?.students ?? [];
    const sum = (key: keyof ReportRow) => rows.reduce((acc, row) => acc + Number(row[key]), 0);
    return {
      ...Object.fromEntries(REPORT_COLUMNS.map((column) => [column, sum(column)])),
      total: sum('total'),
      praises: sum('praises'),
      warnings: sum('warnings'),
    } as ReportCounts;
  });

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
