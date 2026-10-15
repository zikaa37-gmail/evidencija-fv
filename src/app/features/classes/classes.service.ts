import { computed, inject, Injectable, signal } from '@angular/core';
import { tap, catchError, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { environment } from '../../../environments/environment';
import { LoaderService } from '../../shared/components/loader/loader.service';

import { ActiveClass } from './classes.model';

@Injectable({
  providedIn: 'root',
})
export class ClassesService {
  #apiUrl = environment.apiUrl;
  #http = inject(HttpClient);
  #errorHandlerService = inject(ErrorHandlerService);
  #loaderService = inject(LoaderService);

  selectedClass = signal<string>('5-1');

  #possibleClasses = signal<ActiveClass[][]>([]);
  possibleClasses = this.#possibleClasses.asReadonly();

  #thisYearClasses = signal<ActiveClass[][]>([]);
  thisYearClasses = this.#thisYearClasses.asReadonly();

  triggerFilteredStudents = signal<boolean>(false);

  constructor() {
    this.getPossibleClasses();
  }

  getClasses() {
    this.#loaderService.isLoading.set(true);

    this.#http
      .get<ActiveClass[]>(`${this.#apiUrl}/classes`)
      .pipe(
        take(1),
        tap((classes) => {
          this.setThisYearClasses(classes);
          this.#loaderService.isLoading.set(false);
        }),
        catchError((err) => {
          return this.#errorHandlerService.handleError(
            err,
            'classesError',
            true,
          );
        }),
      )
      .subscribe();
  }

  saveClasses(): void {
    this.#loaderService.isLoading.set(true);

    const classes: ActiveClass[] = this.#thisYearClasses().flat();

    this.#http
      .post<ActiveClass[][]>(`${this.#apiUrl}/classes`, classes)
      .pipe(
        take(1),
        tap((classes) => {
          this.#thisYearClasses.set(classes);
          this.#loaderService.isLoading.set(false);
        }),
        catchError((err) =>
          this.#errorHandlerService.handleError(err, 'saveClassesError', true),
        ),
      )
      .subscribe();
  }

  updateClasses(): void {
    const classes: ActiveClass[] = this.#thisYearClasses().flat();

    this.#http
      .post<ActiveClass[]>(`${this.#apiUrl}/classes`, classes)
      .pipe(
        take(1),
        tap((classes) => {
          this.setThisYearClasses(classes);
          this.#loaderService.isLoading.set(false);
        }),
        catchError((err) =>
          this.#errorHandlerService.handleError(
            err,
            'updateClassesError',
            true,
          ),
        ),
      )
      .subscribe();
  }

  getPossibleClasses(): void {
    let x = [];
    for (let i = 5; i <= 8; i++) {
      let arr: ActiveClass[] = [];
      for (let j = 1; j <= 10; j++) {
        arr.push({ className: `${i.toString()}-${j.toString()}` });
        this.sortItemsByClassName(arr);
      }
      x.push(arr);
    }
    this.#possibleClasses.set(x);
  }

  setThisYearClasses(classes: ActiveClass[]): void {
    const classesNames: ActiveClass[] = classes.map((c) => ({
      id: c.id,
      className: c.className,
    }));
    const classesArr: ActiveClass[][] = [[], [], [], []];

    classesNames.map((c) => {
      const className = c.className;
      switch (true) {
        case className.includes('5-'):
          classesArr[0].push(c);
          break;
        case className.includes('6-'):
          classesArr[1].push(c);
          break;
        case className.includes('7-'):
          classesArr[2].push(c);
          break;
        case className.includes('8-'):
          classesArr[3].push(c);
          break;
      }
    });
    this.#thisYearClasses.set(classesArr);
  }

  sortItemsByClassName(arr: ActiveClass[]): ActiveClass[] {
    return arr.sort((a, b) => {
      return parseInt(a.className) - parseInt(b.className);
    });
  }

  setSelectedClass(className: string) {
    this.selectedClass.set(className);
    this.triggerFilteredStudents.set(true);
  }
}
