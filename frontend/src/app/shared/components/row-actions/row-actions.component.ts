import { Component, input, output, signal } from '@angular/core';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import { TranslatePipe } from '@ngx-translate/core';

export interface RowAction {
  id: string;
  label: string;
  icon: string;
  danger?: boolean;
}

@Component({
  selector: 'app-row-actions',
  templateUrl: './row-actions.component.html',
  styleUrl: './row-actions.component.scss',
  imports: [TranslatePipe, CdkOverlayOrigin, CdkConnectedOverlay],
})
export class RowActionsComponent {
  readonly actions = input.required<RowAction[]>();
  readonly selected = output<string>();

  protected readonly open = signal(false);
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
  ];

  toggle(): void {
    this.open.update((open) => !open);
  }

  close(): void {
    this.open.set(false);
  }

  select(action: RowAction): void {
    this.close();
    this.selected.emit(action.id);
  }
}
