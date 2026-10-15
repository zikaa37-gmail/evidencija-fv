import { inject, Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { LoaderService } from '../components/loader/loader.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  #loaderService = inject(LoaderService);
  #tranlate = inject(TranslateService);
  #toaster = inject(NotificationService);

  handleError(err: any, message: string, isServerdown = false) {
    if (isServerdown) {
      this.#loaderService.errorMessage.set(
        'Server is down, please try again later',
      );
    } else {
      this.#loaderService.errorMessage.set(null);
    }
    this.#toaster.error(this.#tranlate.instant(`toaster.${message}`));
    this.#loaderService.isLoading.set(false);
    return throwError(() => err);
  }
}
