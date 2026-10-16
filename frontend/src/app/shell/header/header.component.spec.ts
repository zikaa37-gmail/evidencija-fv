import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([{ path: '**', children: [] }]), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles the menu and closes it after a link is clicked', () => {
    const element: HTMLElement = fixture.nativeElement;
    const collapse = element.querySelector('.navbar-collapse')!;

    element.querySelector<HTMLButtonElement>('[data-testid="menu-toggle"]')!.click();
    fixture.detectChanges();
    expect(collapse.classList).toContain('show');

    element.querySelector<HTMLButtonElement>('.nav-link')!.click();
    fixture.detectChanges();
    expect(collapse.classList).not.toContain('show');
  });
});
