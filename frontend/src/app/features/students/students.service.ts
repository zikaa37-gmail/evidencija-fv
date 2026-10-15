import { computed, effect, inject, Injectable } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { catchError, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ClassesService } from '../classes/classes.service';
import {
  ImportSummary,
  Sex,
  Student,
  StudentImportRow,
  StudentPayload,
} from './students.interface';

const MALE_VALUES = ['m', 'male', 'muški', 'muski', 'dečak', 'decak'];
const FEMALE_VALUES = ['ž', 'z', 'f', 'female', 'ženski', 'zenski', 'devojčica', 'devojcica'];

function splitList(value: unknown): string[] {
  return value == null
    ? []
    : String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function parseSex(value: string): Sex | null {
  const normalized = value.trim().toLowerCase();
  if (MALE_VALUES.includes(normalized)) {
    return 'male';
  }
  return FEMALE_VALUES.includes(normalized) ? 'female' : null;
}

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  #apiUrl = environment.apiUrl;
  #http = inject(HttpClient);
  #auth = inject(AuthService);
  #errorHandler = inject(ErrorHandlerService);
  #loader = inject(LoaderService);
  #classesService = inject(ClassesService);
  #notification = inject(NotificationService);
  #translate = inject(TranslateService);

  #studentsResource = httpResource<Student[]>(
    () =>
      this.#auth.isAuthenticated()
        ? { url: `${this.#apiUrl}/students/list`, method: 'POST', body: {} }
        : undefined,
    { defaultValue: [] },
  );

  readonly students = computed(() =>
    this.#studentsResource.hasValue() ? this.#studentsResource.value() : [],
  );

  readonly filteredStudents = computed(() =>
    this.students().filter(
      (student) => student.class_name === this.#classesService.selectedClass(),
    ),
  );

  constructor() {
    this.#loader.watch(this.#studentsResource.isLoading);
    effect(() => {
      if (this.#studentsResource.error()) {
        this.#errorHandler.notify('studentsError');
      }
    });
  }

  create(payload: StudentPayload): Observable<Student> {
    return this.#loader
      .track(this.#http.post<Student>(`${this.#apiUrl}/students`, payload))
      .pipe(
        tap((student) => {
          this.#studentsResource.value.update((students) => [...students, student]);
          this.#classesService.reload();
          this.#notifySuccess('createStudentSuccess');
        }),
        catchError((error) => this.#errorHandler.handleError(error, 'createStudentError')),
      );
  }

  update(id: number, payload: StudentPayload): Observable<Student> {
    return this.#loader
      .track(this.#http.put<Student>(`${this.#apiUrl}/students/${id}`, payload))
      .pipe(
        tap((student) => {
          this.#replace(student);
          this.#classesService.reload();
          this.#notifySuccess('updateStudentsSuccess');
        }),
        catchError((error) => this.#errorHandler.handleError(error, 'updateStudentsError')),
      );
  }

  import(rows: StudentImportRow[]): Observable<ImportSummary> {
    return this.#loader
      .track(this.#http.post<ImportSummary>(`${this.#apiUrl}/students/import`, { students: rows }))
      .pipe(
        tap((summary) => {
          this.#studentsResource.reload();
          this.#classesService.reload();
          this.#notification.success(
            this.#translate.instant('toaster.importSuccess', summary),
          );
        }),
        catchError((error) => this.#errorHandler.handleError(error, 'importError')),
      );
  }

  reactivateStudent(student: Student): void {
    this.#changeStatus(student, 'activate', 'reactivateStudent');
  }

  deactivateStudent(student: Student): void {
    this.#changeStatus(student, 'deactivate', 'deactivateStudent');
  }

  parseExcelRow(row: unknown[]): StudentImportRow | null {
    const cell = (index: number) =>
      row[index] == null ? '' : String(row[index]).trim();
    const sex = parseSex(cell(2));

    if (!cell(0) || !cell(1) || !sex || !cell(3)) {
      return null;
    }

    return {
      first_name: cell(0),
      last_name: cell(1),
      sex,
      class_name: cell(3).replace(/\s+/g, ''),
      emergency_contact_name: cell(4) || null,
      emergency_contact_phone: cell(5) || null,
      sports: splitList(row[8]),
      health_issues: splitList(row[10]),
    };
  }

  #changeStatus(
    student: Student,
    endpoint: 'activate' | 'deactivate',
    messagePrefix: string,
  ): void {
    this.#loader
      .track(this.#http.patch<Student>(`${this.#apiUrl}/students/${student.id}/${endpoint}`, {}))
      .pipe(
        catchError((error) =>
          this.#errorHandler.notifyAndComplete(error, `${messagePrefix}Error`),
        ),
      )
      .subscribe((updated) => {
        this.#replace(updated);
        this.#classesService.reload();
        this.#notifySuccess(`${messagePrefix}Success`);
      });
  }

  #replace(student: Student): void {
    this.#studentsResource.value.update((students) =>
      students.map((item) => (item.id === student.id ? student : item)),
    );
  }

  #notifySuccess(messageKey: string): void {
    this.#notification.success(
      this.#translate.instant(`toaster.${messageKey}`),
    );
  }
}
