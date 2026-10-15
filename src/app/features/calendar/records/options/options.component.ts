import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { OptionItem } from '../records.interface';
import { RecordsService } from '../records.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss',
  imports: [TranslatePipe, MatButton],
})
export class OptionsComponent {
  #dialogRef = inject(MatDialogRef<OptionsComponent, OptionItem>);
  protected recordsService = inject(RecordsService);

  setOption(option: OptionItem): void {
    this.recordsService.selectOption(option.id);
    this.#dialogRef.close(option);
  }

  closeModal(): void {
    this.#dialogRef.close();
  }
}
