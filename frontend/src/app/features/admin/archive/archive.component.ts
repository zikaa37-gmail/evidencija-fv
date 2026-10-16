import { Component, DestroyRef, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';

import { environment } from '../../../../environments/environment';
import { ArchivedStudent } from '../../../core/school-year/school-year.model';
import { ListRowComponent } from '../../../shared/components/list-row/list-row.component';
import { LoaderService } from '../../../shared/components/loader/loader.service';

interface ArchiveGroup {
  schoolYear: string;
  students: ArchivedStudent[];
}

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss',
  imports: [DatePipe, TranslatePipe, ListRowComponent],
})
export class ArchiveComponent {
  readonly #archive = httpResource<ArchivedStudent[]>(
    () => ({ url: `${environment.apiUrl}/students/archive/list`, method: 'POST', body: {} }),
    { defaultValue: [] },
  );

  protected readonly groups = computed<ArchiveGroup[]>(() => {
    const students = this.#archive.hasValue() ? this.#archive.value() : [];
    const bySchoolYear = new Map<string, ArchivedStudent[]>();
    for (const student of students) {
      const key = student.last_school_year ?? '-';
      bySchoolYear.set(key, [...(bySchoolYear.get(key) ?? []), student]);
    }
    return [...bySchoolYear.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([schoolYear, items]) => ({
        schoolYear,
        students: [...items].sort(
          (a, b) =>
            (a.last_class_name ?? '').localeCompare(b.last_class_name ?? '', 'sr', { numeric: true }) ||
            a.last_name.localeCompare(b.last_name, 'sr'),
        ),
      }));
  });

  protected readonly loaded = computed(() => this.#archive.hasValue());

  constructor() {
    inject(DestroyRef).onDestroy(inject(LoaderService).watch(this.#archive.isLoading));
  }
}
