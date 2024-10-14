import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsUploadComponent } from './students-upload.component';

describe('StudentsUploadComponent', () => {
  let component: StudentsUploadComponent;
  let fixture: ComponentFixture<StudentsUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentsUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentsUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
