import { Component, computed, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../core/auth/auth.service';

const LINKS = [
  { name: 'student-records', url: '/student-records', adminOnly: false },
  { name: 'studentsList', url: '/students', adminOnly: false },
  { name: 'reports', url: '/reports', adminOnly: false },
  { name: 'admin', url: '/admin', adminOnly: true },
];

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [TranslatePipe, RouterLink, RouterLinkActive, MatButton, MatIconButton],
})
export class HeaderComponent {
  protected readonly auth = inject(AuthService);
  protected readonly links = computed(() =>
    LINKS.filter((link) => !link.adminOnly || this.auth.isAdmin()),
  );
}
