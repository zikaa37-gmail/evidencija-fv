import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.scss',
  imports: [TranslatePipe, AvatarComponent],
})
export class ProfileHeaderComponent {
  readonly name = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly photo = input<string | null | undefined>(null);
  readonly closed = output<void>();
}
