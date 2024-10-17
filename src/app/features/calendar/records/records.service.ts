import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Note, OptionItem, RecordOptions } from './records.interface';
import {
  Sexes,
  Sex,
  Statuses,
  Student,
} from '../../students/students.interface';
import { TranslateService } from '@ngx-translate/core';
import { ErrorHandlerService } from 'src/app/shared/services/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class RecordsService {
  apiUrl = environment.apiUrl;
  translate = inject(TranslateService);
  errorHandlerService = inject(ErrorHandlerService);
  options = RecordOptions;
  // sexes = Sexes;
  statuses = Statuses;

  constructor(private http: HttpClient) {}

  addNote(note: Note): Observable<any> {
    return this.http
      .post('', note)
      .pipe(catchError((err) => this.errorHandlerService.handleError(err)));
  }
  getOptions(): OptionItem[] {
    return [
      {
        id: 1,
        option: `options.${this.options.EQUIPMENT}`,
        icon: 'fa fa-2x fa-shirt',
        selected: false,
        bgColor: 'primary',
      },
      {
        id: 2,
        option: `options.${this.options.PITY}`,
        icon: 'fa fa-2x fa-venus',
        selected: false,
        bgColor: 'primary',
      },
      {
        id: 3,
        option: `options.${this.options.LATE}`,
        icon: 'fa fa-clock',
        selected: false,
        bgColor: 'primary',
      },
      {
        id: 4,
        option: `options.${this.options.ILL}`,
        icon: 'fa fa-square-plus',
        selected: false,
        bgColor: 'primary',
      },
      {
        id: 4,
        option: `options.${this.options.ABSENT}`,
        icon: 'fa fa-2x fa-minus',
        selected: false,
        bgColor: 'primary',
      },
      {
        id: 4,
        option: `options.${this.options.NONE}`,
        icon: 'fa fa-2x fa-close',
        selected: false,
        bgColor: 'accent',
      },
    ];
  }

  // getStudents(): Student[] {
  //   return [
  //     {
  //       id: 1,
  //       firstName: 'Petar',
  //       lastName: 'Zivanovic',
  //       sex: 'male',
  //       section: {
  //         grade: '7',
  //         department: '3',
  //       },
  //       issues: [],
  //       info: {
  //         emergency: {
  //           name: 'Igor Zivanovic stariji',
  //           phone: '+38163331030',
  //         },
  //         departmentHead: {
  //           name: 'Jovan Memedovic',
  //           phone: '265456554645',
  //         },
  //         sports: [this.translate.instant('sports.basketball')],
  //       },
  //       status: this.statuses.ACTIVE,
  //     },
  //     {
  //       id: 2,
  //       firstName: 'Vuk',
  //       lastName: 'Zivanovic',
  //       sex: 'male', //'SEXES.MALE',
  //       section: {
  //         grade: '5',
  //         department: '2',
  //       },
  //       issues: ['HEART'],
  //       info: {
  //         emergency: {
  //           name: 'Igor Zivanovic',
  //           phone: '+38163331030',
  //         },
  //         departmentHead: {
  //           name: 'Slavko Tatic',
  //           phone: '658854841',
  //         },
  //         sports: [this.translate.instant('sports.basketball')],
  //       },
  //       status: this.statuses.ACTIVE,
  //     },
  //     {
  //       id: 3,
  //       firstName: 'Lidija',
  //       lastName: 'Comagic Zivanovic',
  //       sex: 'male', //SEXES.MALE',
  //       section: {
  //         grade: '5',
  //         department: '2',
  //       },
  //       issues: ['HEAD', 'LEGS'],
  //       info: {
  //         emergency: {
  //           name: 'Igor Zivanovic',
  //           phone: '+38163331030',
  //         },
  //         departmentHead: {
  //           name: 'Srecko Susic',
  //           phone: '324322432',
  //         },
  //         sports: [
  //           this.translate.instant('sports.gymnastics'),
  //           this.translate.instant('sports.volleyball'),
  //         ],
  //       },
  //       status: this.statuses.ACTIVE,
  //     },
  //   ];
  // }
}
