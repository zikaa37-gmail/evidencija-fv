import { ApplicationConfig } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { TranslatedTitleStrategy } from './shared/services/translated-title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslateService({
      lang: 'sr',
      fallbackLang: 'sr',
      loader: provideTranslateHttpLoader({
        prefix: 'translations/',
        suffix: '.json',
      }),
    }),
    provideRouter(routes),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    provideAnimationsAsync(),
    provideHttpClient(),
  ],
};
