import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Input() item!: Student;
  @Output() deletedItem = new EventEmitter<Student>();
  @Output() publishedItem = new EventEmitter<Student>();

  onItemDelete() {
    this.deletedItem.emit(this.item);
  }

  onItemPublish() {
    this.publishedItem.emit(this.item);
  }
}
