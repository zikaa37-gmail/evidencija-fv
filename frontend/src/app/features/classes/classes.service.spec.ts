import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { environment } from '../../../environments/environment';
import { ClassesService } from './classes.service';

const CLASSES_URL = `${environment.apiUrl}/classes`;

function configure(): HttpTestingController {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideTranslateService(),
    ],
  });
  return TestBed.inject(HttpTestingController);
}

describe('ClassesService', () => {
  afterEach(() => localStorage.clear());

  it('does not request classes when nobody is logged in', () => {
    const http = configure();
    TestBed.inject(ClassesService);
    TestBed.tick();

    http.expectNone(CLASSES_URL);
  });

  describe('when logged in', () => {
    let service: ClassesService;
    let http: HttpTestingController;

    const names = (groups: { className: string }[][]) =>
      groups.map((group) => group.map((item) => item.className));

    beforeEach(async () => {
      localStorage.setItem('efv_refresh_token', 'refresh');
      localStorage.setItem(
        'efv_user',
        JSON.stringify({ id: 1, name: 'Admin', email: 'a@b.c', role: 'admin', school_id: 1 }),
      );
      http = configure();
      service = TestBed.inject(ClassesService);

      TestBed.tick();
      http
        .expectOne(CLASSES_URL)
        .flush([{ className: '6-1' }, { className: '5-10' }, { className: '5-2' }]);
      await TestBed.inject(ApplicationRef).whenStable();
    });

    afterEach(() => http.verify());

    it('groups active classes by grade and sorts sections numerically', () => {
      expect(names(service.thisYearClasses())).toEqual([['5-2', '5-10'], ['6-1']]);
    });

    it('offers only classes that are not active', () => {
      const possible = names(service.possibleClasses()).flat();

      expect(possible).not.toContain('5-2');
      expect(possible).toContain('5-1');
      expect(possible).toHaveLength(37);
    });

    it('toggles a class between possible and active', () => {
      service.toggleClass('8-3');
      expect(names(service.thisYearClasses()).at(-1)).toEqual(['8-3']);

      service.toggleClass('8-3');
      expect(names(service.thisYearClasses()).flat()).not.toContain('8-3');
    });
  });
});
