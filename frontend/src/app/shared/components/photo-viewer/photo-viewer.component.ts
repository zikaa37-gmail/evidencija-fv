import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

export interface PhotoViewerData {
  photo: string;
  name: string;
}

@Component({
  selector: 'app-photo-viewer',
  templateUrl: './photo-viewer.component.html',
  styleUrl: './photo-viewer.component.scss',
  imports: [TranslatePipe, MatDialogClose],
})
export class PhotoViewerComponent {
  protected readonly data = inject<PhotoViewerData>(MAT_DIALOG_DATA);
}
