import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { GlobalService } from 'src/app/shared/services/global.service';

@Component({
  selector: 'app-calendar-body',
  templateUrl: './calendar-body.component.html',
  styleUrls: ['./calendar-body.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class CalendarBodyComponent {
  protected globalService = inject(GlobalService);
  @Input() dates!: string[];
  @Input() days!: string[];
  @Input() selected!: string;
  @Output() selectedDate = new EventEmitter<string>();

  onDateSelect(date: string) {
    this.selectedDate.emit(date);
  }
}
