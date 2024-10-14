import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './components/card/card.component';
import { MaterialModule } from '../modules/material.module';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { TranslateModule } from '@ngx-translate/core';
import { OptionsComponent } from './components/options/options.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { XlsxFileUploadComponent } from './components/xlsx-file-upload/xlsx-file-upload.component';
import { DepartmentSelectorComponent } from './department-selector/department-selector.component';


@NgModule({
  declarations: [
    CardComponent,
    DropdownComponent,
    OptionsComponent,
    XlsxFileUploadComponent,
    DepartmentSelectorComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    FormsModule
  ],
  exports: [
    CardComponent,
    DropdownComponent,
    OptionsComponent,
    XlsxFileUploadComponent,
    DepartmentSelectorComponent,



    MaterialModule,
    TranslateModule,
    NgbModule,
    FormsModule
  ]
})
export class SharedModule { }
