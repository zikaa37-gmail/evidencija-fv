import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RecordsHelperService } from 'src/app/features/calendar/records/records.helper.service';
import { OptionItem } from 'src/app/features/calendar/records/records.interface';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class OptionsComponent implements OnInit {
  options = this.helper.getOptions();
  @Output() selectedOption = new EventEmitter<OptionItem>();

  constructor(private helper: RecordsHelperService) {}

  ngOnInit(): void {}

  setOption(option: OptionItem) {
    this.options.forEach((op) => (op.selected = !!(op === option)));
    console.log(this.options);
    this.selectedOption.emit(option);
  }
}
