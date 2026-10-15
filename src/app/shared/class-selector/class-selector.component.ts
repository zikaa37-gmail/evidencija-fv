import { Component, inject, signal } from '@angular/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { TranslatePipe } from '@ngx-translate/core';

import { ClassesService } from '../../features/classes/classes.service';

@Component({
  selector: 'app-class-selector',
  templateUrl: './class-selector.component.html',
  styleUrl: './class-selector.component.scss',
  imports: [
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    TranslatePipe,
  ],
})
export class ClassSelectorComponent {
  protected classesService = inject(ClassesService);
  protected readonly panelOpen = signal(false);

  onClassSelect(className: string): void {
    this.classesService.setSelectedClass(className);
    this.panelOpen.set(false);
  }
}
