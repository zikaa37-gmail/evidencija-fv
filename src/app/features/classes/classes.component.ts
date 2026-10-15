import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

import { GlobalService } from '../../shared/services/global.service';
import { ClassesService } from './classes.service';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.scss',
  imports: [TranslatePipe, MatButton],
})
export class ClassesComponent {
  protected classesService = inject(ClassesService);
  protected globalService = inject(GlobalService);
}
