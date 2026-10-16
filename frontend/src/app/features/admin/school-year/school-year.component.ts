import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../environments/environment';
import { RolloverPreview } from '../../../core/school-year/school-year.model';
import { SchoolYearService } from '../../../core/school-year/school-year.service';
import {
  ConfirmationModalComponent,
  ConfirmationModalData,
} from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LoaderService } from '../../../shared/components/loader/loader.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ClassesService } from '../../classes/classes.service';
import { StudentsService } from '../../students/students.service';

@Component({
  selector: 'app-school-year',
  templateUrl: './school-year.component.html',
  styleUrl: './school-year.component.scss',
  imports: [DatePipe, RouterLink, TranslatePipe, MatButton, MatAnchor],
})
export class SchoolYearComponent {
  #dialog = inject(MatDialog);
  #translate = inject(TranslateService);
  #notification = inject(NotificationService);
  #errorHandler = inject(ErrorHandlerService);
  #classesService = inject(ClassesService);
  #studentsService = inject(StudentsService);
  protected schoolYearService = inject(SchoolYearService);

  protected readonly preview = httpResource<RolloverPreview>(
    () => `${environment.apiUrl}/school-years/rollover/preview`,
  );
  protected readonly firstGradeSections = signal(0);
  protected readonly completedYear = signal<string | null>(null);

  constructor() {
    inject(DestroyRef).onDestroy(inject(LoaderService).watch(this.preview.isLoading));
    effect(() => {
      if (this.preview.hasValue()) {
        this.firstGradeSections.set(this.preview.value().first_grade_sections);
      }
    });
  }

  setSections(value: string): void {
    const sections = Math.max(0, Math.min(20, Math.trunc(Number(value) || 0)));
    this.firstGradeSections.set(sections);
  }

  confirmRollover(preview: RolloverPreview): void {
    const data: ConfirmationModalData = {
      title: this.#translate.instant('admin.rolloverConfirmTitle', {
        year: preview.next_school_year,
      }),
      question: this.#translate.instant('admin.rolloverConfirmQuestion', {
        year: preview.next_school_year,
        sections: this.firstGradeSections(),
      }),
      leftButtonText: 'buttons.cancel',
      rightButtonText: 'admin.rolloverAction',
      leftButtonIcon: 'close',
      rightButtonIcon: 'school',
    };

    this.#dialog
      .open<ConfirmationModalComponent, ConfirmationModalData, boolean>(
        ConfirmationModalComponent,
        { data, width: '560px', maxWidth: '100vw', disableClose: true },
      )
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.#rollover();
        }
      });
  }

  #rollover(): void {
    this.schoolYearService.rollover(this.firstGradeSections()).subscribe({
      next: (schoolYear) => {
        this.completedYear.set(schoolYear.name);
        this.#classesService.reload();
        this.#studentsService.reload();
        this.preview.reload();
        this.#notification.success(
          this.#translate.instant('admin.rolloverSuccess', { year: schoolYear.name }),
        );
      },
      error: (error) => this.#errorHandler.notifyAndComplete(error, 'rolloverError'),
    });
  }
}
