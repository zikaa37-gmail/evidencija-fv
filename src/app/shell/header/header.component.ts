import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslatePipe, RouterModule, MatButtonModule],
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
