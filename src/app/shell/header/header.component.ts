import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [CommonModule, TranslateModule, RouterModule, MatButtonModule]
})
export class HeaderComponent {
  links = [
    {
      name: 'student-records',
      url: '/student-records',
    },
    {
      name: 'classes',
      url: '/classes',
    },

    {
      name: 'uploadStudents',
      url: '/students/upload',
    },
    {
      name: 'studentsList',
      url: '/students',
    },
    // {
    //   name: 'Settings',
    //   url: '/settings',
    // },
    // {
    //   name: 'Logout',
    //   url: '/logout',
    // },
  ];
}
