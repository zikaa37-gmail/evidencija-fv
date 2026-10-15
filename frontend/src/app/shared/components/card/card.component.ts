import { Component, input, output } from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

import { Student } from '../../../features/students/students.interface';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [MatCard, MatCardHeader, MatCardContent, MatIcon, TranslatePipe],
})
export class CardComponent {
  readonly item = input.required<Student>();
  readonly editable = input(false);
  readonly allowEdit = input(true);
  readonly deletedItem = output<Student>();
  readonly reactivatedItem = output<Student>();
  readonly edited = output<Student>();
}
