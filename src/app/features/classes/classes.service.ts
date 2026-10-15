import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { catchError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ActiveClass } from './classes.model';

const GRADES = [5, 6, 7, 8];
const SECTIONS_PER_GRADE = 10;

const ALL_CLASSES: ActiveClass[] = GRADES.flatMap((grade) =>
  Array.from({ length: SECTIONS_PER_GRADE }, (_, index) => ({
    className: `${grade}-${index + 1}`,
  })),
);

function sectionOf(className: string): number {
  return Number(className.split('-')[1]);
}

function groupByGrade(classes: ActiveClass[]): ActiveClass[][] {
  return GRADES.map((grade) =>
    classes
      .filter((item) => item.className.startsWith(`${grade}-`))
      .sort((a, b) => sectionOf(a.className) - sectionOf(b.className)),
  ).filter((group) => group.length > 0);
}

@Injectable({
  providedIn: 'root',
})
export class ClassesService {
  #apiUrl = environment.apiUrl;
  #http = inject(HttpClient);
  #errorHandler = inject(ErrorHandlerService);
  #loader = inject(LoaderService);
  #notification = inject(NotificationService);
  #translate = inject(TranslateService);

  #classesResource = httpResource<ActiveClass[]>(
    () => `${this.#apiUrl}/classes`,
    { defaultValue: [] },
  );

  #activeClasses = computed(() =>
    this.#classesResource.hasValue() ? this.#classesResource.value() : [],
  );

  readonly selectedClass = signal('5-1');

  readonly thisYearClasses = computed(() =>
    groupByGrade(this.#activeClasses()),
  );

  readonly possibleClasses = computed(() => {
    const active = new Set(this.#activeClasses().map((c) => c.className));
    return groupByGrade(ALL_CLASSES.filter((c) => !active.has(c.className)));
  });

  constructor() {
    this.#loader.watch(this.#classesResource.isLoading);
    effect(() => {
      if (this.#classesResource.error()) {
        this.#errorHandler.notify('classesError');
      }
    });
  }

  toggleClass(className: string): void {
    const classes = this.#activeClasses();
    const isActive = classes.some((c) => c.className === className);
    this.#classesResource.value.set(
      isActive
        ? classes.filter((c) => c.className !== className)
        : [...classes, { className }],
    );
  }

  saveClasses(): void {
    this.#loader
      .track(
        this.#http.post<ActiveClass[]>(
          `${this.#apiUrl}/classes`,
          this.#activeClasses(),
        ),
      )
      .pipe(
        catchError((error) =>
          this.#errorHandler.handleError(error, 'saveClassesError'),
        ),
      )
      .subscribe((classes) => {
        this.#classesResource.value.set(classes);
        this.#notification.success(
          this.#translate.instant('toaster.saveClassesSuccess'),
        );
      });
  }

  setSelectedClass(className: string): void {
    this.selectedClass.set(className);
  }
}
