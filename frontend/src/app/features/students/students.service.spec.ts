import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { StudentsService } from './students.service';

describe('StudentsService.parseExcelRow', () => {
  let service: StudentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService()],
    });
    service = TestBed.inject(StudentsService);
  });

  it('maps a complete row and normalizes sex, class and lists', () => {
    expect(
      service.parseExcelRow([
        ' Ana ', 'Anić', 'Ž', '5 - 1', 'Majka', '0601', 'x', 'y', 'odbojka, rukomet', 'active', 'astma',
      ]),
    ).toEqual({
      first_name: 'Ana',
      last_name: 'Anić',
      sex: 'female',
      class_name: '5-1',
      emergency_contact_name: 'Majka',
      emergency_contact_phone: '0601',
      sports: ['odbojka', 'rukomet'],
      health_issues: ['astma'],
    });
  });

  it('accepts male variants and missing optional cells', () => {
    expect(service.parseExcelRow(['Marko', 'Marić', 'M', '6-2'])).toMatchObject({
      sex: 'male',
      emergency_contact_name: null,
      sports: [],
      health_issues: [],
    });
  });

  it('rejects incomplete rows', () => {
    expect(service.parseExcelRow(['Marko', '', 'M', '6-2'])).toBeNull();
    expect(service.parseExcelRow(['Marko', 'Marić', '?', '6-2'])).toBeNull();
    expect(service.parseExcelRow([])).toBeNull();
  });
});
