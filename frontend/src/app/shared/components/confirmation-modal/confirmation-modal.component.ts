import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

export interface ConfirmationModalData {
  title: string;
  question: string;
  leftButtonText: string;
  rightButtonText: string;
  leftButtonIcon: string;
  rightButtonIcon: string;
}

@Component({
  selector: 'app-confirmation-modal',
  imports: [
    TranslatePipe,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
  ],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
})
export class ConfirmationModalComponent {
  protected readonly data = inject<ConfirmationModalData>(MAT_DIALOG_DATA);
}
