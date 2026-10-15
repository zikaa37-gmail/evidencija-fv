import { computed, effect, inject, Injectable } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { catchError, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ClassesService } from '../classes/classes.service';
import { Sex, Student, StudentStatus } from './students.interface';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  #apiUrl = environment.apiUrl;
  #http = inject(HttpClient);
  #errorHandler = inject(ErrorHandlerService);
  #loader = inject(LoaderService);
  #classesService = inject(ClassesService);
  #notification = inject(NotificationService);
  #translate = inject(TranslateService);

  #studentsResource = httpResource<Student[]>(
    () => `${this.#apiUrl}/students`,
    { defaultValue: [] },
  );

  readonly students = computed(() =>
    this.#studentsResource.hasValue() ? this.#studentsResource.value() : [],
  );

  readonly filteredStudents = computed(() =>
    this.students().filter(
      (student) => student.className === this.#classesService.selectedClass(),
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

  saveStudents(students: Student[]): Observable<Student[]> {
    const activeStudents = students.filter(
      (student) => student.status === StudentStatus.ACTIVE,
    );

    return this.#loader
      .track(
        this.#http.post<Student[]>(`${this.#apiUrl}/students`, activeStudents),
      )
      .pipe(
        tap((saved) => {
          this.#studentsResource.value.set(saved);
          this.#notifySuccess('saveStudentsSuccess');
        }),
        catchError((error) =>
          this.#errorHandler.handleError(error, 'saveStudentsError'),
        ),
      );
  }

  deleteStudent(student: Student): void {
    this.#loader
      .track(this.#http.delete(`${this.#apiUrl}/students/${student.id}`))
      .pipe(
        catchError((error) =>
          this.#errorHandler.handleError(error, 'deleteStudentsError'),
        ),
      )
      .subscribe(() => {
        this.#studentsResource.value.update((students) =>
          students.filter((s) => s.id !== student.id),
        );
        this.#notifySuccess('deleteStudentsSuccess');
      });
  }

  reactivateStudent(student: Student): void {
    this.#changeStatus(student, StudentStatus.ACTIVE, 'activate', 'reactivateStudent');
  }

  deactivateStudent(student: Student): void {
    this.#changeStatus(student, StudentStatus.INACTIVE, 'deactivate', 'deactivateStudent');
  }

  mapStudentFromExcelData(row: unknown[]): Student {
    const cell = (index: number) =>
      row[index] == null ? '' : String(row[index]).trim();

    return {
      id: '',
      firstName: cell(0),
      lastName: cell(1),
      sex: cell(2) as Sex,
      className: cell(3),
      classNameId: '',
      schoolYearId: '',
      schoolYear: '',
      info: {
        emergency: { name: cell(4), phone: cell(5) },
        departmentHead: { name: cell(6), phone: cell(7) },
        sports: cell(8)
          .split(',')
          .map((sport) => sport.trim())
          .filter(Boolean),
      },
      status: (cell(9) as StudentStatus) || StudentStatus.ACTIVE,
      notes: { healthIssues: [], negativeComments: [], positiveComments: [] },
    };
  }

  #changeStatus(
    student: Student,
    status: StudentStatus,
    endpoint: 'activate' | 'deactivate',
    messagePrefix: string,
  ): void {
    this.#loader
      .track(
        this.#http.patch(
          `${this.#apiUrl}/students/${endpoint}/${student.id}`,
          student,
        ),
      )
      .pipe(
        catchError((error) =>
          this.#errorHandler.handleError(error, `${messagePrefix}Error`),
        ),
      )
      .subscribe(() => {
        this.#studentsResource.value.update((students) =>
          students.map((s) => (s.id === student.id ? { ...s, status } : s)),
        );
        this.#notifySuccess(`${messagePrefix}Success`);
      });
  }

  #notifySuccess(messageKey: string): void {
    this.#notification.success(
      this.#translate.instant(`toaster.${messageKey}`),
    );
  }
}
