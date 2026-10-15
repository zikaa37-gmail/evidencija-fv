import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shell/header/header.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, HeaderComponent, LoaderComponent],
})
export class AppComponent {
  title = 'evidencija-fv';
  titleService = inject(Title);
  #translate = inject(TranslateService);
  activatedRoute = inject(ActivatedRoute);
  #router = inject(Router);
  #destroy = new Subject<void>();

  ngOnInit(): void {
    this.#router.events.pipe(takeUntil(this.#destroy)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let currentRoute = this.#router.routerState.root.snapshot;

        while (currentRoute.firstChild) {
          currentRoute = currentRoute.firstChild;
        }
        const titleKey = currentRoute.data['title'];

        if (titleKey) {
          this.#translate.get(titleKey).subscribe((translatedTitle: string) => {
            setTimeout(() => {
              document.title = 'Evidencija učenika - ' + translatedTitle;
            }, 10);
          });
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.#destroy.next();
    this.#destroy.complete();
  }
}
