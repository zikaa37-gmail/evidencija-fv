import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule], //NgbNavModule
})
export class HeaderComponent implements OnInit {
  links = [
    { title: 'One', fragment: 'one' },
    { title: 'Two', fragment: 'two' },
  ];

  constructor() {}

  ngOnInit(): void {}
}
