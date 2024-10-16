import { inject, Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { LoaderService } from '../components/loader/loader.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  loaderService = inject(LoaderService);

  handleError(err: any) {
    this.loaderService.isLoading.set(false);
    return throwError(err);
  }
}
