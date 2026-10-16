import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { ListRowComponent } from './list-row.component';

@Component({
  imports: [ListRowComponent],
  template: `
    <app-list-row title="Marko Babić" [photo]="photo" [inactive]="true">
      <span class="content">content</span>
      <button rowEnd class="end">end</button>
    </app-list-row>
  `,
})
class HostComponent {
  photo: string | null = null;
}

describe('ListRowComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideTranslateService()],
    }).compileComponents();
  });

  it('shows initials, projected content and the end slot', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.avatar')?.textContent?.trim()).toBe('MB');
    expect(element.querySelector('.row-main .content')).not.toBeNull();
    expect(element.querySelector('.row-end .end')).not.toBeNull();
    expect(element.querySelector('app-list-row')?.classList).toContain('inactive');
  });

  it('shows the photo as an enlargeable button', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.photo = 'data:image/jpeg;base64,AAAA';
    fixture.detectChanges();

    const photo = fixture.nativeElement.querySelector('[data-testid="avatar-photo"] img');
    expect(photo?.getAttribute('src')).toBe('data:image/jpeg;base64,AAAA');
  });
});
