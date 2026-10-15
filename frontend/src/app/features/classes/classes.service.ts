import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { catchError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ClassSlot, SchoolClass } from './classes.model';

const GRADES = [5, 6, 7, 8];
const SECTIONS_PER_GRADE = 10;

const ALL_SLOTS: ClassSlot[] = GRADES.flatMap((grade) =>
  Array.from({ length: SECTIONS_PER_GRADE }, (_, index) => ({
    name: `${grade}-${index + 1}`,
    grade,
    section: index + 1,
  })),
);

function groupByGrade<T extends ClassSlot>(classes: T[]): T[][] {
  return GRADES.map((grade) =>
    classes
      .filter((item) => item.grade === grade)
      .sort((a, b) => a.section - b.section),
  ).filter((group) => group.length > 0);
}

@Injectable({
  providedIn: 'root',
})
export class ClassesService {
  #apiUrl = environment.apiUrl;
  #http = inject(HttpClient);
  #auth = inject(AuthService);
  #errorHandler = inject(ErrorHandlerService);
  #loader = inject(LoaderService);
  #notification = inject(NotificationService);
  #translate = inject(TranslateService);

  #classesResource = httpResource<SchoolClass[]>(
    () =>
      this.#auth.isAuthenticated()
        ? { url: `${this.#apiUrl}/classes/list`, method: 'POST', body: {} }
        : undefined,
    { defaultValue: [] },
  );

  readonly classes = computed(() =>
    this.#classesResource.hasValue() ? this.#classesResource.value() : [],
  );

  #draft = signal<ClassSlot[] | null>(null);
  readonly #editedSlots = computed(() => this.#draft() ?? this.classes());

  readonly selectedClass = signal('5-1');

  readonly thisYearClasses = computed(() => groupByGrade(this.classes()));

  readonly selectedSlots = computed(() => groupByGrade(this.#editedSlots()));

  readonly possibleClasses = computed(() => {
    const selected = new Set(this.#editedSlots().map((slot) => slot.name));
    return groupByGrade(ALL_SLOTS.filter((slot) => !selected.has(slot.name)));
  });

  readonly hasChanges = computed(() => this.#draft() !== null);

  constructor() {
    this.#loader.watch(this.#classesResource.isLoading);
    effect(() => {
      if (this.#classesResource.error()) {
        this.#errorHandler.notify('classesError');
      }
    });
  }

  toggleClass(slot: ClassSlot): void {
    const slots = this.#editedSlots();
    const isSelected = slots.some((item) => item.name === slot.name);
    this.#draft.set(
      isSelected
        ? slots.filter((item) => item.name !== slot.name)
        : [...slots, { name: slot.name, grade: slot.grade, section: slot.section }],
    );
  }

  discardChanges(): void {
    this.#draft.set(null);
  }

  saveClasses(): void {
    const classes = this.#editedSlots().map(({ grade, section }) => ({ grade, section }));

    this.#loader
      .track(this.#http.post<SchoolClass[]>(`${this.#apiUrl}/classes/sync`, { classes }))
      .pipe(
        catchError((error) =>
          this.#errorHandler.notifyAndComplete(error, 'saveClassesError'),
        ),
      )
      .subscribe((saved) => {
        this.#classesResource.value.set(saved);
        this.#draft.set(null);
        this.#notification.success(
          this.#translate.instant('toaster.saveClassesSuccess'),
        );
      });
  }

  reload(): void {
    this.#classesResource.reload();
  }

  setSelectedClass(className: string): void {
    this.selectedClass.set(className);
  }
}
