import { Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../core/auth/auth.service';

const LINKS = [
  { name: 'student-records', url: '/student-records', adminOnly: false },
  { name: 'classes', url: '/classes', adminOnly: true },
  { name: 'uploadStudents', url: '/students/upload', adminOnly: true },
  { name: 'studentsList', url: '/students', adminOnly: false },
];

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [TranslatePipe, RouterLink, RouterLinkActive, MatButton],
})
export class HeaderComponent {
  protected readonly auth = inject(AuthService);
  protected readonly links = computed(() =>
    LINKS.filter((link) => !link.adminOnly || this.auth.isAdmin()),
  );
}
