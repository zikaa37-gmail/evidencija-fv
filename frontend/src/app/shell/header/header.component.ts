import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs';

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
  imports: [TranslatePipe, RouterLink, RouterLinkActive, MatButton],
})
export class HeaderComponent {
  protected readonly auth = inject(AuthService);
  protected readonly menuOpen = signal(false);
  protected readonly links = computed(() =>
    LINKS.filter((link) => !link.adminOnly || this.auth.isAdmin()),
  );

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMenu());
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected logout(): void {
    this.closeMenu();
    this.auth.logout();
  }
}
