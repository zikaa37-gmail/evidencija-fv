import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../core/auth/auth.service';
import { ClassSelectorComponent } from '../../shared/class-selector/class-selector.component';
import {
  ConfirmationModalComponent,
  ConfirmationModalData,
} from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { ListRowComponent } from '../../shared/components/list-row/list-row.component';
import { RowAction, RowActionsComponent } from '../../shared/components/row-actions/row-actions.component';
import { GlobalService } from '../../shared/services/global.service';
import { ClassesService } from '../classes/classes.service';
import {
  StudentFormComponent,
  StudentFormData,
} from './student-form/student-form.component';
import { openStudentDetails } from './student-details/student-details.component';
import { Student, StudentStatus } from './students.interface';
import { StudentsService } from './students.service';

const DETAILS_ACTION: RowAction = { id: 'details', label: 'students.details', icon: 'info' };
const EDIT_ACTION: RowAction = { id: 'edit', label: 'buttons.edit', icon: 'edit' };
const TEACHER_ACTIONS = [DETAILS_ACTION];
const ACTIVE_ADMIN_ACTIONS = [
  DETAILS_ACTION,
  EDIT_ACTION,
  { id: 'deactivate', label: 'students.deactivate', icon: 'trash', danger: true },
];
const INACTIVE_ADMIN_ACTIONS = [
  DETAILS_ACTION,
  EDIT_ACTION,
  { id: 'reactivate', label: 'buttons.reactivate', icon: 'restore' },
];

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss',
  imports: [TranslatePipe, ClassSelectorComponent, ListRowComponent, RowActionsComponent, MatButton],
})
export class StudentsComponent {
  #dialog = inject(MatDialog);
  #router = inject(Router);
  #globalService = inject(GlobalService);
  protected auth = inject(AuthService);
  protected studentsService = inject(StudentsService);
  protected classesService = inject(ClassesService);
  protected readonly StudentStatus = StudentStatus;

  readonly #selectedClassId = computed(
    () =>
      this.classesService
        .classes()
        .find((item) => item.name === this.classesService.selectedClass())?.id ?? null,
  );

  actionsFor(student: Student): RowAction[] {
    if (!this.auth.isAdmin()) {
      return TEACHER_ACTIONS;
    }
    return student.status === StudentStatus.ACTIVE ? ACTIVE_ADMIN_ACTIONS : INACTIVE_ADMIN_ACTIONS;
  }

  onAction(student: Student, action: string): void {
    switch (action) {
      case 'details':
        openStudentDetails(this.#dialog, { student }, this.#globalService.isMobile());
        break;
      case 'edit':
        this.openForm(student);
        break;
      case 'deactivate':
        this.onStudentDelete(student);
        break;
      case 'reactivate':
        this.onStudentReactivate(student);
        break;
    }
  }

  openForm(student: Student | null = null): void {
    this.#dialog.open<StudentFormComponent, StudentFormData>(StudentFormComponent, {
      data: { student, schoolClassId: this.#selectedClassId() },
      width: this.#globalService.isMobile() ? '100vw' : '640px',
      maxWidth: '100vw',
      panelClass: 'user-dialog',
      disableClose: true,
    });
  }

  onStudentDelete(student: Student): void {
    this.#confirm(
      {
        title: 'modal.deactivateTitle',
        question: 'modal.deactivateQuestion',
        leftButtonText: 'buttons.cancel',
        rightButtonText: 'students.deactivate',
        leftButtonIcon: 'close',
        rightButtonIcon: 'trash',
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
        rightButtonIcon: 'restore',
      },
      () => this.studentsService.reactivateStudent(student),
    );
  }

  gotoUpload(): void {
    this.#router.navigate(['/admin/import']);
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
