import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CalendarService } from '../calendar.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-month-selector',
  templateUrl: './month-selector.component.html',
  styleUrls: ['./month-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class MonthSelectorComponent {
  protected calendarService = inject(CalendarService);
  @Input() month!: string;
  @Input() monthIndex!: number;
  @Input() year!: string;
  @Output() action = new EventEmitter<string>();

  setAction(action: 'prev' | 'next') {
    this.action.emit(action);
  }
}
