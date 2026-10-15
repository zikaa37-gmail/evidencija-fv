import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import {
  BrowserAnimationsModule,
  provideAnimations,
} from '@angular/platform-browser/animations';
import { LoaderService } from './shared/components/loader/loader.service';
// import { StudentsService } from './features/students/students.service';
import { StudentsService } from './features/students/students.service';
import { ClassesService } from './features/classes/classes.service';
import { ToastrModule } from 'ngx-toastr';
//   import { AuthInterceptor } from '../auth/auth.interceptor';
//   import { LoaderService } from '../shared/components/loader/loader.service';
export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      TranslateModule.forRoot({
        defaultLanguage: 'sr',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
      ToastrModule.forRoot({
        positionClass: 'toast-top-full-width',
      }),
    ),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),

    provideHttpClient(withInterceptorsFromDi()),
    //   {
    //     provide: HTTP_INTERCEPTORS,
    //     useClass: AuthInterceptor,
    //     multi: true,
    //   },
    {
      provide: APP_INITIALIZER,
      useFactory: initData,
      deps: [ClassesService, StudentsService],
      multi: true,
    },
    LoaderService,
    ClassesService,
    StudentsService,
  ],
};

export function initData(
  classesService: ClassesService,
  studentsService: StudentsService,
) {
  return (): void => {
    classesService.getClasses();
    studentsService.getAllStudents();
  };
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'translations/', '.json');
}
