import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { Student } from '../../../features/students/students.interface';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [TranslatePipe],
})
export class CardComponent {
  readonly item = input.required<Student>();
  readonly editable = input(false);
  readonly allowEdit = input(true);
  readonly deletedItem = output<Student>();
  readonly reactivatedItem = output<Student>();
  readonly edited = output<Student>();
}
