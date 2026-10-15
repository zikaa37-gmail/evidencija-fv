import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { CardComponent } from '../../shared/components/card/card.component';
import { ClassSelectorComponent } from '../../shared/class-selector/class-selector.component';
import {
  ConfirmationModalComponent,
  ConfirmationModalData,
} from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { GlobalService } from '../../shared/services/global.service';
import { ClassesService } from '../classes/classes.service';
import { Student } from './students.interface';
import { StudentsService } from './students.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss',
  imports: [TranslatePipe, CardComponent, ClassSelectorComponent, MatButton],
})
export class StudentsComponent {
  #dialog = inject(MatDialog);
  #router = inject(Router);
  #globalService = inject(GlobalService);
  protected studentsService = inject(StudentsService);
  protected classesService = inject(ClassesService);

  onStudentDelete(student: Student): void {
    this.#confirm(
      {
        title: 'modal.deleteTitle',
        question: 'modal.deleteQuestion',
        leftButtonText: 'buttons.cancel',
        rightButtonText: 'buttons.delete',
        leftButtonIcon: 'close',
        rightButtonIcon: 'delete',
      },
      () => this.studentsService.deactivateStudent(student),
    );
  }

  onStudentReactivate(student: Student): void {
    this.#confirm(
      {
        title: 'modal.reactivateTitle',
        question: 'modal.reactivateQuestion',
        leftButtonText: 'buttons.cancel',
        rightButtonText: 'buttons.reactivate',
        leftButtonIcon: 'close',
        rightButtonIcon: 'star',
      },
      () => this.studentsService.reactivateStudent(student),
    );
  }

  gotoUpload(): void {
    this.#router.navigate(['students/upload']);
  }

  #confirm(data: ConfirmationModalData, onConfirm: () => void): void {
    this.#dialog
      .open<ConfirmationModalComponent, ConfirmationModalData, boolean>(
        ConfirmationModalComponent,
        {
          data,
          height: 'auto',
          width: this.#globalService.isMobile() ? '100vw' : '600px',
          maxWidth: '100vw',
          panelClass: 'user-dialog',
          disableClose: true,
        },
      )
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          onConfirm();
        }
      });
  }
}
