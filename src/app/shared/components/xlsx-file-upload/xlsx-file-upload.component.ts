import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-xlsx-file-upload',
  templateUrl: './xlsx-file-upload.component.html',
  styleUrls: ['./xlsx-file-upload.component.scss']
})
export class XlsxFileUploadComponent implements OnInit {
  allSheetsData: any[] = [];
  @Output() data = new EventEmitter<any>();//

  constructor() { }

  ngOnInit(): void {
  }

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;

    if (target.files.length !== 1) {
      throw new Error('Can not upload multiple files')
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      for (let i = 0; i < wb.SheetNames.length; i++) {
        const wsname: string = wb.SheetNames[i];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        const data = (XLSX.utils.sheet_to_json(ws, { header: 1 }));

        data.shift();
        this.allSheetsData.push(data);
      }

      this.data.emit(this.allSheetsData);
      // console.log('allSheetsData', this.allSheetsData);
    }
    reader.readAsBinaryString(target.files[0]);

  }

}
