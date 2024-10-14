import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CalendarHelperService } from '../calendar.helper.service';

@Component({
  selector: 'app-month-selector',
  templateUrl: './month-selector.component.html',
  styleUrls: ['./month-selector.component.scss']
})
export class MonthSelectorComponent {
  @Input() month!: string;
  @Input() monthIndex!: number;
  @Input() year!: string;
  @Output() action = new EventEmitter<string>();

  constructor(private helper: CalendarHelperService) { }

  setAction(action: 'prev' | 'next') {
    this.action.emit(action)
  }

}
