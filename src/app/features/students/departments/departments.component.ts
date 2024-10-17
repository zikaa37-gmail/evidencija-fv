import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { GlobalService } from 'src/app/shared/services/global.service';
import { Section } from '../students.interface';
import { StudentsService } from '../students.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonModule],
})
export class DepartmentsComponent implements OnInit {
  studentsService = inject(StudentsService);
  globalService = inject(GlobalService);
  @Output() selectedSection = new EventEmitter<Section[]>();

  ngOnInit(): void {
    this.studentsService.getPossibleSections();
    this.getSections();
  }

  getSections() {
    this.studentsService.thisYearSections().forEach((row, index) => {
      row.forEach((section: Section) => {
        this.filterSections(section.grade, section.department, index);
      });
    });
  }

  filterSections(grade: string, department: string, arrIndex: number) {
    const item: Section = { grade, department };
    const sourceArr: Section[] =
      this.studentsService.possibleSections()[arrIndex];
    const sourceItem = sourceArr.find(
      (el: any) => el.department === item.department,
    )!;
    const sourceIndex = sourceArr.indexOf(sourceItem);
    this.removeFromArray(sourceArr, sourceIndex);
  }

  onSectionSelect(grade: string, department: string, arrIndex: number) {
    const item: Section = { grade, department };

    const destinationArr = this.studentsService.thisYearSections()[arrIndex];
    const destItem = destinationArr.find(
      (el: any) => el.department === item.department,
    )!;
    const destinationIndex = destinationArr.indexOf(destItem);

    const sourceArr = this.studentsService.possibleSections()[arrIndex];
    const sourceItem = sourceArr.find(
      (el: any) => el.department === item.department,
    )!;
    const sourceIndex = sourceArr.indexOf(sourceItem);
    if (destItem) {
      this.removeFromArray(destinationArr, destinationIndex);
      this.addToArray(sourceArr, item);
    } else {
      this.removeFromArray(sourceArr, sourceIndex);
      this.addToArray(destinationArr, item);
    }

    destinationArr.sort();
    console.log('sourceArr', sourceArr);

    console.log('destinationArr', destinationArr);
  }

  addToArray(arr: Section[], item: Section) {
    arr.push(item);
    arr = this.studentsService.sortItemsByDepartment(arr);
  }

  removeFromArray(arr: Section[], index: number) {
    arr.splice(index, 1);
    arr = this.studentsService.sortItemsByDepartment(arr);
  }

  save() {
    console.log('SAVED');
    this.studentsService.saveSections();
  }
}
