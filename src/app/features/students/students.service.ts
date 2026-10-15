import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, take, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

import { environment } from 'src/environments/environment';
import { ErrorHandlerService } from 'src/app/shared/services/error-handler.service';
import { LoaderService } from 'src/app/shared/components/loader/loader.service';

import { Student, StudentStatus } from './students.interface';
import { ClassesService } from '../classes/classes.service';
@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  #apiUrl = environment.apiUrl;
  #http = inject(HttpClient);
  #errorHandlerService = inject(ErrorHandlerService);
  #loaderService = inject(LoaderService);
  #classesService = inject(ClassesService);
  #toaster = inject(ToastrService);
  #translate = inject(TranslateService);

  #students = signal<Student[]>([]);
  students = this.#students.asReadonly();

  #filteredStudents = signal<Student[]>([]);
  filteredStudents = this.#filteredStudents.asReadonly();

  constructor() {
    effect(
      () => {
        if (this.#classesService.triggerFilteredStudents()) {
          this.filterStudents();
        }
      },
      {
        allowSignalWrites: true,
      },
    );
  }

  saveStudents(students: Student[]): void {
    this.#loaderService.isLoading.set(true);

    const body = students.filter((s) => s.status === 'active')!;

    this.#http
      .post<Student[]>(`${this.#apiUrl}/students`, body)
      .pipe(
        take(1),
        tap((students) => {
          this.#students.set(students);
          this.#loaderService.isLoading.set(false);
        }),
        catchError((err) =>
          this.#errorHandlerService.handleError(
            err,
            'saveStudentsSuccess',
            true,
          ),
        ),
      )
      .subscribe();
  }

  getAllStudents(): void {
    this.#loaderService.isLoading.set(true);
    this.#http
      .get<Student[]>(`${this.#apiUrl}/students`)
      .pipe(
        take(1),
        tap((students: Student[]) => {
          this.#students.set(students);
          console.log('students', students);
          this.#classesService.triggerFilteredStudents.set(true);
          this.#loaderService.isLoading.set(false);
        }),
        catchError((err) => {
          return this.#errorHandlerService.handleError(
            err,
            'studentsError',
            true,
          );
        }),
      )
      .subscribe();
  }

  getStudentsByClassName() {
    const filteredStudents = this.students().filter(
      (student: Student) =>
        student.className === this.#classesService.selectedClass(),
    );
    this.#filteredStudents.set(filteredStudents);
  }

  mapStudentFromExcelData(row: any[]): Student {
    const student: Student = {} as Student;
    student.firstName = row[0];
    student.lastName = row[1];
    student.sex = row[2];
    student.className = row[3].toString();
    student.info!.emergency.name = row[4] || '';
    student.info!.emergency.phone = row[5] || '';
    student.info!.departmentHead.name = row[6] || '';
    student.info!.departmentHead.phone = row[7] || '';
    student.info!.sports = row[8] || [];
    student.status = row[9];
    return student;
  }

  filterStudents() {
    const filteredStudents = this.students().filter(
      (student) => student.className === this.#classesService.selectedClass(),
    );
    this.#filteredStudents.set(filteredStudents);
    console.log('filteredStudents', filteredStudents);
    this.#classesService.triggerFilteredStudents.set(false);
  }

  deleteStudent(student: Student) {
    this.#loaderService.isLoading.set(true);
    this.#http
      .delete(`${this.#apiUrl}/students/${student.id}`)
      .pipe(
        take(1),
        tap(() => {
          this.#students.set(
            this.students().filter((s) => s.id !== student.id),
          );
          this.#filteredStudents.set(
            this.filteredStudents().filter((s) => s.id !== student.id),
          );
          this.#loaderService.isLoading.set(false);
          this.#toaster.success(
            this.#translate.instant('toaster.deleteStudentsSuccess'),
          );
        }),
        catchError((err) =>
          this.#errorHandlerService.handleError(err, 'deleteStudentError'),
        ),
      )
      .subscribe();
  }

  reactivateStudent(student: Student) {
    this.#loaderService.isLoading.set(true);
    this.#http
      .patch(`${this.#apiUrl}/students/activate/${student.id}`, student)
      .pipe(
        take(1),
        tap(() => {
          const selectedStudent = this.students().find(
            (s) => s.id === student.id,
          )!;
          selectedStudent.status = StudentStatus.ACTIVE;
          this.#loaderService.isLoading.set(false);
          this.#loaderService.isLoading.set(false);
          this.#toaster.success(
            this.#translate.instant('toaster.reactivateStudentSuccess'),
          );
        }),
        catchError((err) =>
          this.#errorHandlerService.handleError(err, 'reactivateStudentError'),
        ),
      )
      .subscribe();
  }

  deactivateStudent(student: Student) {
    this.#loaderService.isLoading.set(true);
    return this.#http
      .patch(`${this.#apiUrl}/students/deactivate/${student.id}`, student)
      .pipe(
        take(1),
        tap(() => {
          const selectedStudent = this.students().find(
            (s) => s.id === student.id,
          )!;
          selectedStudent.status = StudentStatus.INACTIVE;
          this.#loaderService.isLoading.set(false);
          this.#toaster.success(
            this.#translate.instant('toaster.deactivateStudentsSuccess'),
          );
        }),
        catchError((err) =>
          this.#errorHandlerService.handleError(err, 'reactivateStudentError'),
        ),
      )
      .subscribe();
  }
}
