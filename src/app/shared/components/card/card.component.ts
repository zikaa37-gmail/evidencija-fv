import { Component, EventEmitter, input, output } from '@angular/core';
import { Student } from 'src/app/features/students/students.interface';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, TranslateModule],
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
