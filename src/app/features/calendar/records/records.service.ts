import { Injectable, signal } from '@angular/core';

import { OptionItem, RecordOptions } from './records.interface';

function option(
  id: number,
  reason: RecordOptions,
  icon: string,
  bgColor: OptionItem['bgColor'],
): OptionItem {
  return { id, option: `options.${reason}`, icon, bgColor, selected: false };
}

const OPTIONS: OptionItem[] = [
  option(1, RecordOptions.ABSENT, 'fa fa-2x fa-minus', 'danger'),
  option(2, RecordOptions.EQUIPMENT, 'fa fa-2x fa-shirt', 'primary'),
  option(3, RecordOptions.PITY, 'fa fa-2x fa-venus', 'primary'),
  option(4, RecordOptions.LATE, 'fa fa-clock', 'primary'),
  option(5, RecordOptions.ILL, 'fa fa-square-plus', 'primary'),
  option(6, RecordOptions.NONE, 'fa fa-2x fa-close', 'accent'),
];

@Injectable({
  providedIn: 'root',
})
export class RecordsService {
  #options = signal<OptionItem[]>(OPTIONS);
  readonly options = this.#options.asReadonly();

  selectOption(id: number): void {
    this.#options.update((options) =>
      options.map((item) => ({ ...item, selected: item.id === id })),
    );
  }
}
