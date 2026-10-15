import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, throwError } from 'rxjs';

import { NotificationService } from './notification.service';

interface ValidationErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

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
    this.#show(error, messageKey);
    return throwError(() => error);
  }

  notifyAndComplete(error: unknown, messageKey: string) {
    this.#show(error, messageKey);
    return EMPTY;
  }

  #show(error: unknown, messageKey: string): void {
    const serverMessage = this.validationMessage(error);
    if (serverMessage) {
      this.#notification.error(serverMessage);
    } else {
      this.notify(messageKey);
    }
  }

  validationMessage(error: unknown): string | null {
    if (!(error instanceof HttpErrorResponse) || error.status !== 422) {
      return null;
    }
    const body = error.error as ValidationErrorBody | null;
    const firstError = Object.values(body?.errors ?? {})[0]?.[0];
    return firstError ?? body?.message ?? null;
  }
}
