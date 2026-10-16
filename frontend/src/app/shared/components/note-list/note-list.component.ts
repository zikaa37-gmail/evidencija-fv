import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

import { NOTE_TYPE, NoteType } from '../../../features/calendar/records/records.interface';

export interface NoteListItem {
  id: number;
  date: string;
  type: NoteType;
  text: string;
  author_name?: string | null;
}

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss',
  imports: [DatePipe, TranslatePipe],
})
export class NoteListComponent {
  readonly notes = input.required<NoteListItem[]>();
  readonly showAuthor = input(false);
  protected readonly NOTE_TYPE = NOTE_TYPE;
}
