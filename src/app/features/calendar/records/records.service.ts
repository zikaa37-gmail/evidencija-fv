import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Note } from './records.interface';

@Injectable({
  providedIn: 'root'
})
export class RecordsService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  addNote(note: Note): Observable<any> {
    return this.http.post('', note).pipe(
      catchError(err => {
        throwError(err);
        return of(err)
      })
    )
  }
}
function throwError(err: any) {
  throw new Error('Function not implemented.');
}

