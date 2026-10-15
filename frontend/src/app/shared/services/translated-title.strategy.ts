import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  #title = inject(Title);
  #translate = inject(TranslateService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageKey = this.buildTitle(snapshot);
    if (!pageKey) {
      return;
    }

    this.#translate
      .get(['appTitle', pageKey])
      .pipe(take(1))
      .subscribe((translations) =>
        this.#title.setTitle(
          `${translations['appTitle']} - ${translations[pageKey]}`,
        ),
      );
  }
}
