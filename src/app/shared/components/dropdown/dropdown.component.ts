import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DropdownItem } from './dropdown.interface';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {
  @Input() control?: FormControl = new FormControl('');
  @Input() label?: string;
  @Input() items!: DropdownItem[];

  constructor() { }

  ngOnInit(): void {
  }

}
