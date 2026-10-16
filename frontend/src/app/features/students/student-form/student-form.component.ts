import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { resizeImage } from '../../../core/utils/resize-image';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { ClassesService } from '../../classes/classes.service';
import { Sex, Student, StudentPayload } from '../students.interface';
import { StudentsService } from '../students.service';

export interface StudentFormData {
  student: Student | null;
  schoolClassId: number | null;
}

function toList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    AvatarComponent,
  ],
})
export class StudentFormComponent {
  #studentsService = inject(StudentsService);
  #dialogRef = inject(MatDialogRef<StudentFormComponent, Student>);
  readonly #data = inject<StudentFormData>(MAT_DIALOG_DATA);
  protected classesService = inject(ClassesService);

  protected readonly isEdit = this.#data.student !== null;
  protected readonly saving = signal(false);
  protected readonly photo = signal<string | null>(this.#data.student?.photo ?? null);
  #notification = inject(NotificationService);
  #translate = inject(TranslateService);

  protected readonly form = new FormGroup({
    first_name: new FormControl(this.#data.student?.first_name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    last_name: new FormControl(this.#data.student?.last_name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    sex: new FormControl<Sex | null>(this.#data.student?.sex ?? null, {
      validators: [Validators.required],
    }),
    school_class_id: new FormControl<number | null>(
      this.#data.student?.school_class_id ?? this.#data.schoolClassId,
      { validators: [Validators.required] },
    ),
    emergency_contact_name: new FormControl(
      this.#data.student?.emergency_contact_name ?? '',
      { nonNullable: true },
    ),
    emergency_contact_phone: new FormControl(
      this.#data.student?.emergency_contact_phone ?? '',
      { nonNullable: true },
    ),
    sports: new FormControl(this.#data.student?.sports.join(', ') ?? '', {
      nonNullable: true,
    }),
    health_issues: new FormControl(
      this.#data.student?.health_issues.join(', ') ?? '',
      { nonNullable: true },
    ),
  });

  async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    try {
      this.photo.set(await resizeImage(file));
    } catch {
      this.#notification.error(this.#translate.instant('toaster.photoError'));
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: StudentPayload = {
      first_name: value.first_name.trim(),
      last_name: value.last_name.trim(),
      sex: value.sex as Sex,
      school_class_id: value.school_class_id as number,
      emergency_contact_name: value.emergency_contact_name.trim() || null,
      emergency_contact_phone: value.emergency_contact_phone.trim() || null,
      sports: toList(value.sports),
      health_issues: toList(value.health_issues),
      photo: this.photo(),
    };

    this.saving.set(true);
    const request = this.#data.student
      ? this.#studentsService.update(this.#data.student.id, payload)
      : this.#studentsService.create(payload);

    request.subscribe({
      next: (student) => this.#dialogRef.close(student),
      error: () => this.saving.set(false),
    });
  }
}
