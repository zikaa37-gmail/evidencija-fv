import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { StudentsService } from 'src/app/features/students/students.service';

@Component({
  selector: 'app-department-selector',
  templateUrl: './department-selector.component.html',
  styleUrls: ['./department-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, MatExpansionModule, TranslateModule],
})
export class DepartmentSelectorComponent {
  studentsService = inject(StudentsService);
  panelOpenState = signal<boolean>(false);

  onSectionSelect(grade: string, department: string) {
    this.studentsService.setSelectedSection(grade, department);
    this.togglePanel();
    this.studentsService.setSelectedSection(grade, department);
  }

  togglePanel() {
    const isOpen = this.panelOpenState();
    this.panelOpenState.set(!isOpen);
  }
}
