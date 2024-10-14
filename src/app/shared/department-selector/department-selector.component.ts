import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Section } from '../../features/students/students.interface';

@Component({
  selector: 'app-department-selector',
  templateUrl: './department-selector.component.html',
  styleUrls: ['./department-selector.component.scss']
})
export class DepartmentSelectorComponent {
  @Input() sections!: any;
  @Output() selectedSection = new EventEmitter<Section>();
  selected!: Section;
  display!: string;
  panelOpenState = true;

  onSectionSelect(grade: string, department: string) {
    this.display = grade + '-' + department;
    this.selected = { grade, department };
    this.panelOpenState = false;
    this.selectedSection.emit({ grade, department });
  }

}
