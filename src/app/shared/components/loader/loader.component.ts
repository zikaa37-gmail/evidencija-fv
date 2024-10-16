import { Component, inject, Input } from '@angular/core';
import { LoaderService } from './loader.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class LoaderComponent {
  loaderService = inject(LoaderService);
  @Input() diameter: number = 50;
  @Input() color: string = 'primary';
  // @Input() strokeWidth: number = 1;
}
