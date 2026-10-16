import { Component, input } from '@angular/core';

import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-list-row',
  templateUrl: './list-row.component.html',
  styleUrl: './list-row.component.scss',
  imports: [AvatarComponent],
  host: {
    class: 'list-row',
    '[class.inactive]': 'inactive()',
  },
})
export class ListRowComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly photo = input<string | null | undefined>(null);
  readonly inactive = input(false);
}
