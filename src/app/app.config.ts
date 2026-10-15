import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { StudentsService } from './features/students/students.service';
import { ClassesService } from './features/classes/classes.service';

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
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideAppInitializer(() => {
      inject(ClassesService).getClasses();
      inject(StudentsService).getAllStudents();
    }),
  ],
};
