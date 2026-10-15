import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [TranslatePipe, RouterLink, RouterLinkActive, MatButton],
})
export class HeaderComponent {
  protected readonly links = [
    { name: 'student-records', url: '/student-records' },
    { name: 'classes', url: '/classes' },
    { name: 'uploadStudents', url: '/students/upload' },
    { name: 'studentsList', url: '/students' },
  ];
}
