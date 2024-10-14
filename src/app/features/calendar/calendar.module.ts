import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarRoutingModule } from './calendar-routing.module';
import { RecordsModalComponent } from './records/records-modal/records-modal.component';
import { RecordsComponent } from './records/records.component';
import { CalendarBodyComponent } from './calendar-body/calendar-body.component';
import { MonthSelectorComponent } from './month-selector/month-selector.component';
import { CalendarComponent } from './calendar.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReportComponent } from './report/report.component';


@NgModule({
  declarations: [
    RecordsComponent,
    RecordsModalComponent,
    MonthSelectorComponent,
    CalendarBodyComponent,
    CalendarComponent,
    ReportComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CalendarRoutingModule
  ],
  exports: [
    MonthSelectorComponent,
  ]
})
export class CalendarModule { }
