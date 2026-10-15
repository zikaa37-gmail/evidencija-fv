import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { OptionItem } from 'src/app/features/calendar/records/records.interface';
import { RecordsService } from 'src/app/features/calendar/records/records.service';
import { LoaderService } from '../../../../shared/components/loader/loader.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-options',
    templateUrl: './options.component.html',
    styleUrls: ['./options.component.scss'],
    imports: [CommonModule, TranslateModule, MatButtonModule]
})
export class OptionsComponent {
  protected recordsService = inject(RecordsService);
  private dialogRef = inject(MatDialogRef<OptionsComponent>);
  loaderService = inject(LoaderService);
  selectedOption = output<OptionItem>();

  setOption(option: OptionItem) {
    this.recordsService
      .options()
      .forEach((op: OptionItem) => (op.selected = !!(op === option)));
    this.selectedOption.emit(option);
    this.closeModal();

    // TODO implement POST/PATCH api
    // this.recordsService.addIssue(this.option.id)
    //   .subscribe(issue => this.closeModal());

    // TODO remove on api implementation
    this.loaderService.isLoading.set(true);
    setTimeout(() => {
      this.loaderService.isLoading.set(false);
    }, 1000);
  }

  closeModal() {
    this.dialogRef.close(null);
  }
}
