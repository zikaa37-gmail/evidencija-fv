import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

const SECTIONS = [
  { url: 'school-year', label: 'admin.schoolYear' },
  { url: 'classes', label: 'menu.classes' },
  { url: 'import', label: 'menu.uploadStudents' },
  { url: 'archive', label: 'admin.archive' },
];

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
})
export class AdminComponent {
  protected readonly sections = SECTIONS;
}
