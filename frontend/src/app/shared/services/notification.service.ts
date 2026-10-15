import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  #snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.#open(message, 'notification-success');
  }

  error(message: string): void {
    this.#open(message, 'notification-error');
  }

  #open(message: string, panelClass: string): void {
    this.#snackBar.open(message, undefined, {
      duration: 4000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass,
    });
  }
}
