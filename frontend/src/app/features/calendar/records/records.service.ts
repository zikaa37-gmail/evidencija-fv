import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { catchError, Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { SchoolYearService } from '../../../core/school-year/school-year.service';
import { LoaderService } from '../../../shared/components/loader/loader.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ClassesService } from '../../classes/classes.service';
import {
  AttendanceReason,
  AttendanceRecord,
  NewNote,
  OptionItem,
  StudentNote,
  toIsoDate,
} from './records.interface';

const OPTIONS: OptionItem[] = [
  { reason: 'absent', label: 'options.absent' },
  { reason: 'equipment', label: 'options.equipment' },
  { reason: 'pity', label: 'options.pity' },
  { reason: 'late', label: 'options.late' },
  { reason: 'ill', label: 'options.ill' },
  { reason: null, label: 'options.none' },
];

function firstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

@Injectable({
  providedIn: 'root',
})
export class RecordsService {
  #apiUrl = environment.apiUrl;
  #http = inject(HttpClient);
  #auth = inject(AuthService);
  #classesService = inject(ClassesService);
  #loader = inject(LoaderService);
  #errorHandler = inject(ErrorHandlerService);
  #notification = inject(NotificationService);
  #translate = inject(TranslateService);
  #schoolYearService = inject(SchoolYearService);

  readonly options = OPTIONS;
  readonly editWindowDays = computed(
    () => this.#schoolYearService.current()?.edit_window_days ?? 7,
  );
  readonly month = signal(firstOfMonth(new Date()));

  readonly #selectedClassId = computed(
    () =>
      this.#classesService
        .classes()
        .find((item) => item.name === this.#classesService.selectedClass())?.id ?? null,
  );

  #attendanceResource = httpResource<AttendanceRecord[]>(
    () => {
      const classId = this.#selectedClassId();
      if (!this.#auth.isAuthenticated() || classId === null) {
        return undefined;
      }
      const month = this.month();
      return {
        url: `${this.#apiUrl}/attendance/list`,
        method: 'POST',
        body: {
          school_class_id: classId,
          from: toIsoDate(month),
          to: toIsoDate(new Date(month.getFullYear(), month.getMonth() + 1, 0)),
        },
      };
    },
    { defaultValue: [] },
  );

  #notesResource = httpResource<StudentNote[]>(
    () => {
      const classId = this.#selectedClassId();
      return this.#auth.isAuthenticated() && classId !== null
        ? { url: `${this.#apiUrl}/notes/list`, method: 'POST', body: { school_class_id: classId } }
        : undefined;
    },
    { defaultValue: [] },
  );

  readonly #records = computed(() =>
    this.#attendanceResource.hasValue() ? this.#attendanceResource.value() : [],
  );

  readonly #recordIndex = computed(
    () => new Map(this.#records().map((record) => [`${record.student_id}|${record.date}`, record.reason])),
  );

  readonly markedDays = computed(
    () => new Set(this.#records().map((record) => Number(record.date.slice(8, 10)))),
  );

  readonly notes = computed(() =>
    this.#notesResource.hasValue() ? this.#notesResource.value() : [],
  );

  constructor() {
    this.#loader.watch(this.#attendanceResource.isLoading);
    effect(() => {
      if (this.#attendanceResource.error()) {
        this.#errorHandler.notify('attendanceError');
      }
    });
  }

  isEditable(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstEditable = new Date(today);
    firstEditable.setDate(today.getDate() - (this.editWindowDays() - 1));
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    return day >= firstEditable && day <= today;
  }

  reasonFor(studentId: number, date: string): AttendanceReason | null {
    return this.#recordIndex().get(`${studentId}|${date}`) ?? null;
  }

  optionFor(reason: AttendanceReason | null): OptionItem | undefined {
    return OPTIONS.find((option) => option.reason === reason);
  }

  notesFor(studentId: number): StudentNote[] {
    return this.notes().filter((note) => note.student_id === studentId);
  }

  saveReason(studentId: number, date: string, reason: AttendanceReason | null): Observable<AttendanceRecord> {
    return this.#loader
      .track(
        this.#http.put<AttendanceRecord>(`${this.#apiUrl}/attendance`, {
          student_id: studentId,
          date,
          reason,
        }),
      )
      .pipe(
        tap((saved) =>
          this.#attendanceResource.value.update((records) => [
            ...records.filter((item) => !(item.student_id === studentId && item.date === date)),
            ...(saved.reason ? [saved] : []),
          ]),
        ),
        catchError((error) => this.#errorHandler.handleError(error, 'saveAttendanceError')),
      );
  }

  addNote(note: NewNote): Observable<StudentNote> {
    return this.#loader
      .track(
        this.#http.post<StudentNote>(`${this.#apiUrl}/notes`, {
          student_id: note.student.id,
          date: note.date,
          type: note.type,
          text: note.text,
        }),
      )
      .pipe(
        tap((saved) => {
          this.#notesResource.value.update((notes) => [saved, ...notes]);
          this.#notification.success(this.#translate.instant('toaster.addNoteSuccess'));
        }),
        catchError((error) => this.#errorHandler.handleError(error, 'addNoteError')),
      );
  }

  deleteNote(note: StudentNote): void {
    this.#loader
      .track(this.#http.delete(`${this.#apiUrl}/notes/${note.id}`))
      .pipe(catchError((error) => this.#errorHandler.notifyAndComplete(error, 'deleteNoteError')))
      .subscribe(() =>
        this.#notesResource.value.update((notes) => notes.filter((item) => item.id !== note.id)),
      );
  }
}
