import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DropdownItem } from './dropdown.interface';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatOptionModule],
})
export class DropdownComponent implements OnInit {
  @Input() control?: FormControl = new FormControl('');
  @Input() label?: string;
  @Input() items!: DropdownItem[];

  constructor() {}

  ngOnInit(): void {}
}
