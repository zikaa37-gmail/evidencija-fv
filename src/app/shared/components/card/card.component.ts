import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Student } from 'src/app/features/students/students.interface';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
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
