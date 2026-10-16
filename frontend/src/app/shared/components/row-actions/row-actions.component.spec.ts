import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { RowActionsComponent } from './row-actions.component';

describe('RowActionsComponent', () => {
  let fixture: ComponentFixture<RowActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RowActionsComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(RowActionsComponent);
    fixture.componentRef.setInput('actions', [
      { id: 'edit', label: 'buttons.edit', icon: 'edit' },
      { id: 'delete', label: 'buttons.delete', icon: 'trash', danger: true },
    ]);
    fixture.detectChanges();
  });

  it('opens the menu and emits the selected action', () => {
    const selected: string[] = [];
    fixture.componentInstance.selected.subscribe((id) => selected.push(id));

    fixture.nativeElement.querySelector('[data-testid="row-actions"]').click();
    fixture.detectChanges();

    const item = document.querySelector<HTMLButtonElement>('[data-testid="action-delete"]');
    expect(document.querySelectorAll('.row-actions-item').length).toBe(2);
    expect(item?.classList).toContain('danger');

    item!.click();
    fixture.detectChanges();

    expect(selected).toEqual(['delete']);
    expect(document.querySelector('[data-testid="row-actions-menu"]')).toBeNull();
  });
});
