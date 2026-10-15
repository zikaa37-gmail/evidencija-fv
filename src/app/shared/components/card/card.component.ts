import {
  Component,
  EventEmitter,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Student } from '../../../features/students/students.interface';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, MatCardModule, MatIconModule, TranslatePipe],
})
export class CardComponent {
  item = input.required<Student>();
  deletedItem = output<Student>();
  reactivatedItem = output<Student>();

  onItemDelete() {
    this.deletedItem.emit(this.item());
  }

  onItemPublish() {
    this.reactivatedItem.emit(this.item());
  }
}
