import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { ClassesService } from '../../features/classes/classes.service';

@Component({
  selector: 'app-class-selector',
  templateUrl: './class-selector.component.html',
  styleUrls: ['./class-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, MatExpansionModule, TranslatePipe],
})
export class ClassSelectorComponent {
  classesService = inject(ClassesService);
  panelOpenState = signal<boolean>(false);

  onClassSelect(className: string) {
    this.classesService.setSelectedClass(className);
    this.togglePanel();
  }

  togglePanel() {
    const isOpen = this.panelOpenState();
    this.panelOpenState.set(!isOpen);
  }
}
