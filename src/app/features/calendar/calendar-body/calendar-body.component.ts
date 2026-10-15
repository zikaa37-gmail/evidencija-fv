import { Component, inject, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { GlobalService } from '../../../shared/services/global.service';

@Component({
  selector: 'app-calendar-body',
  templateUrl: './calendar-body.component.html',
  styleUrl: './calendar-body.component.scss',
  imports: [TranslatePipe],
})
export class CalendarBodyComponent {
  protected globalService = inject(GlobalService);
  readonly dates = input.required<(number | null)[]>();
  readonly days = input.required<string[]>();
  readonly selected = input<number | null>(null);
  readonly dateSelect = output<number>();
}
