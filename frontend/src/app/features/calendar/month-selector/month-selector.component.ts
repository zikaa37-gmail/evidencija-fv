import { Component, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

import { MonthAction } from '../calendar.constants';

@Component({
  selector: 'app-month-selector',
  templateUrl: './month-selector.component.html',
  styleUrl: './month-selector.component.scss',
  imports: [TitleCasePipe, TranslatePipe],
})
export class MonthSelectorComponent {
  readonly month = input.required<string>();
  readonly year = input.required<number>();
  readonly action = output<MonthAction>();
}
