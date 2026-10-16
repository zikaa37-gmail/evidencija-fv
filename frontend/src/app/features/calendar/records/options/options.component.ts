import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { Student } from '../../../students/students.interface';
import { AttendanceReason, OptionItem } from '../records.interface';
import { RecordsService } from '../records.service';

export interface OptionsDialogData {
  student: Student;
  date: string;
}

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss',
  imports: [TranslatePipe, MatButton],
})
export class OptionsComponent {
  #dialogRef = inject(MatDialogRef<OptionsComponent, AttendanceReason | null>);
  protected readonly data = inject<OptionsDialogData>(MAT_DIALOG_DATA);
  protected recordsService = inject(RecordsService);
  protected readonly current = this.recordsService.reasonFor(this.data.student.id, this.data.date);
  protected readonly saving = signal(false);

  setOption(option: OptionItem): void {
    this.saving.set(true);
    this.recordsService.saveReason(this.data.student.id, this.data.date, option.reason).subscribe({
      next: () => this.#dialogRef.close(option.reason),
      error: () => this.saving.set(false),
    });
  }

  closeModal(): void {
    this.#dialogRef.close();
  }
}
