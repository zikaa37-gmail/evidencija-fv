import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Note, OptionItem, RecordOptions } from './records.interface';
import { TranslateService } from '@ngx-translate/core';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { StudentStatus } from '../../students/students.interface';

@Injectable({
  providedIn: 'root',
})
export class RecordsService {
  apiUrl = environment.apiUrl;
  translate = inject(TranslateService);
  errorHandlerService = inject(ErrorHandlerService);
  recordOptions = RecordOptions;
  options = signal<OptionItem[]>(this.getOptions());
  statuses = StudentStatus;

  constructor(private http: HttpClient) {}

  addNote(note: Note): Observable<any> {
    return this.http
      .post('', note)
      .pipe(
        catchError((err) =>
          this.errorHandlerService.handleError(err, 'addNoteError'),
        ),
      );
  }

  getOptions(): OptionItem[] {
    return [
      {
        id: 1,
        option: `options.${this.recordOptions.ABSENT}`,
        icon: 'fa fa-2x fa-minus',
        selected: false,
        bgColor: 'danger',
      },
      {
        id: 2,
        option: `options.${this.recordOptions.EQUIPMENT}`,
        icon: 'fa fa-2x fa-shirt',
        selected: false,
        bgColor: 'primary',
      },
      {
        id: 3,
        option: `options.${this.recordOptions.PITY}`,
        icon: 'fa fa-2x fa-venus',
        selected: false,
        bgColor: 'primary',
      },
      {
        id: 4,
        option: `options.${this.recordOptions.LATE}`,
        icon: 'fa fa-clock',
        selected: false,
        bgColor: 'primary',
      },
      {
        id: 5,
        option: `options.${this.recordOptions.ILL}`,
        icon: 'fa fa-square-plus',
        selected: false,
        bgColor: 'primary',
      },

      {
        id: 6,
        option: `options.${this.recordOptions.NONE}`,
        icon: 'fa fa-2x fa-close',
        selected: false,
        bgColor: 'accent',
      },
    ];
  }
}
