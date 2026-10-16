import { Component, computed, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import {
  PhotoViewerComponent,
  PhotoViewerData,
} from '../photo-viewer/photo-viewer.component';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  imports: [TranslatePipe],
  host: {
    '[class.large]': 'size() === "large"',
  },
})
export class AvatarComponent {
  #dialog = inject(MatDialog);

  readonly name = input.required<string>();
  readonly photo = input<string | null | undefined>(null);
  readonly size = input<'medium' | 'large'>('medium');

  protected readonly initials = computed(() =>
    this.name()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(''),
  );

  enlarge(photo: string): void {
    this.#dialog.open<PhotoViewerComponent, PhotoViewerData>(PhotoViewerComponent, {
      data: { photo, name: this.name() },
      maxWidth: '100vw',
      panelClass: 'photo-dialog',
    });
  }
}
