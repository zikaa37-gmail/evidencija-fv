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

const CLASSES_URL = `${environment.apiUrl}/classes/list`;

function schoolClass(name: string) {
  const [grade, section] = name.split('-').map(Number);
  return { id: grade * 100 + section, name, grade, section, head_teacher_name: null, head_teacher_phone: null, students_count: 0 };
}

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

    http.expectNone(() => true);
  });

  describe('when logged in', () => {
    let service: ClassesService;
    let http: HttpTestingController;

    const names = (groups: { name: string }[][]) =>
      groups.map((group) => group.map((item) => item.name));

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
        .expectOne((request) => request.url === CLASSES_URL && request.method === 'POST')
        .flush([schoolClass('6-1'), schoolClass('5-10'), schoolClass('5-2')]);
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

    it('toggles a class in the draft without touching saved classes', () => {
      const slot = { name: '8-3', grade: 8, section: 3 };

      service.toggleClass(slot);
      expect(names(service.selectedSlots()).at(-1)).toEqual(['8-3']);
      expect(names(service.thisYearClasses()).flat()).not.toContain('8-3');
      expect(service.hasChanges()).toBe(true);

      service.discardChanges();
      expect(names(service.selectedSlots()).flat()).not.toContain('8-3');
      expect(service.hasChanges()).toBe(false);
    });

    it('saves the draft through the sync endpoint', () => {
      service.toggleClass({ name: '5-2', grade: 5, section: 2 });
      service.saveClasses();

      const request = http.expectOne(`${environment.apiUrl}/classes/sync`);
      expect(request.request.body).toEqual({ classes: [{ grade: 6, section: 1 }, { grade: 5, section: 10 }] });
      request.flush([schoolClass('6-1'), schoolClass('5-10')]);

      expect(names(service.thisYearClasses())).toEqual([['5-10'], ['6-1']]);
      expect(service.hasChanges()).toBe(false);
    });
  });
});
