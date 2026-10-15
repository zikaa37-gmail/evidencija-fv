import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { GlobalService } from '../../../shared/services/global.service';

@Component({
  selector: 'app-calendar-body',
  templateUrl: './calendar-body.component.html',
  styleUrls: ['./calendar-body.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, TranslatePipe],
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
