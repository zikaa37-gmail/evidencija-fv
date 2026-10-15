import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { throwError } from 'rxjs';

import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  #translate = inject(TranslateService);
  #notification = inject(NotificationService);

  notify(messageKey: string): void {
    this.#notification.error(this.#translate.instant(`toaster.${messageKey}`));
  }

  handleError(error: unknown, messageKey: string) {
    this.notify(messageKey);
    return throwError(() => error);
  }
}
