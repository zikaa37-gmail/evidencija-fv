import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Student, StudentStatus } from './students.interface';
import { StudentsService } from './students.service';

import { CardComponent } from '../../shared/components/card/card.component';
import { ClassSelectorComponent } from '../../shared/class-selector/class-selector.component';
import { ClassesService } from '../classes/classes.service';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { GlobalService } from '../../shared/services/global.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { take } from 'rxjs';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TranslatePipe,
    CardComponent,
    ClassSelectorComponent,
    MatDialogModule,
    MatButtonModule,
  ],
})
export class StudentsComponent {
  #translate = inject(TranslateService);
  #dialog = inject(MatDialog);
  #router = inject(Router);
  #globalService = inject(GlobalService);
  studentsService = inject(StudentsService);
  classesService = inject(ClassesService);

  selectedClass = '5-1';
  selectedStudent = signal<Student>({} as Student);

  setSelectedClass(className: string) {
    this.classesService.setSelectedClass(className);
  }

  onStudentDelete(student: Student) {
    this.selectedStudent.set(student);
    this.openConfirmationModal(true);
  }

  onStudentReactivate(student: Student) {
    this.selectedStudent.set(student);
    this.openConfirmationModal(false);

    // this.selectedStudent().status = StudentStatus.ACTIVE;
  }

  gotoUpload() {
    this.#router.navigate(['students/upload']);
  }

  openConfirmationModal(isDeactivate: boolean) {
    const dialogRef = this.#dialog.open(ConfirmationModalComponent, {
      height: 'auto',
      width: this.#globalService.isMobile() ? '100vw' : '600px',
      maxWidth: '100vw',
      panelClass: 'user-dialog',
      disableClose: true,
    });

    dialogRef.componentInstance.data = {
      title: this.#translate.instant(
        isDeactivate ? 'modal.deleteTitle' : 'modal.reactivateTitle',
      ),
      question: this.#translate.instant(
        isDeactivate ? 'modal.deleteQuestion' : 'modal.reactivateQuestion',
      ),
      leftButtonText: this.#translate.instant('buttons.cancel'),
      rightButtonText: this.#translate.instant(
        isDeactivate ? 'buttons.delete' : 'buttons.reactivate',
      ),
      leftButtonIcon: 'close ',
      rightButtonIcon: isDeactivate ? 'delete' : 'star',
    };

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: boolean) => {
        if (result) {
          if (isDeactivate) {
            this.studentsService.deactivateStudent(this.selectedStudent());
          } else {
            this.studentsService.reactivateStudent(this.selectedStudent());
          }
        }
      });
  }
}
