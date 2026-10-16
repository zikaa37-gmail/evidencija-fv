import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from './core/auth/auth.service';
import { SchoolYearService } from './core/school-year/school-year.service';
import { HeaderComponent } from './shell/header/header.component';
import { LoaderComponent } from './shared/components/loader/loader.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, RouterLink, TranslatePipe, HeaderComponent, LoaderComponent],
})
export class AppComponent {
  protected readonly auth = inject(AuthService);
  protected readonly schoolYearService = inject(SchoolYearService);
}
