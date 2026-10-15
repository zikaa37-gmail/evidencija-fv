import { Component, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-xlsx-file-upload',
  templateUrl: './xlsx-file-upload.component.html',
  styleUrl: './xlsx-file-upload.component.scss',
  imports: [TranslatePipe, MatButton],
})
export class XlsxFileUploadComponent {
  readonly data = output<unknown[][][]>();

  async onFileChange(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const sheets = workbook.SheetNames.map((name) => {
      const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[name], {
        header: 1,
      });
      return rows.slice(1);
    });

    this.data.emit(sheets);
  }
}
