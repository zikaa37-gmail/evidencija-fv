import { Component, inject, OnInit, output } from '@angular/core';
import { GlobalService } from 'src/app/shared/services/global.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { ActiveClass } from './classes.model';
import { ClassesService } from './classes.service';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonModule],
})
export class ClassesComponent implements OnInit {
  classesService = inject(ClassesService);
  globalService = inject(GlobalService);

  ngOnInit(): void {
    this.classesService.getPossibleClasses();
    this.getClasses();
  }

  getClasses() {
    this.classesService.thisYearClasses().forEach((row, index) => {
      row.forEach((item: ActiveClass) => {
        this.filterClasses(item.className, index);
      });
    });
  }

  filterClasses(className: string, arrIndex: number) {
    const sourceArr: ActiveClass[] =
      this.classesService.possibleClasses()[arrIndex];
    const sourceItem = sourceArr.find(
      (el: ActiveClass) => el.className === className,
    )!;
    const sourceIndex = sourceArr.indexOf(sourceItem);
    this.removeFromArray(sourceArr, sourceIndex);
  }

  onClassSelect(className: string, arrIndex: number) {
    const destinationArr = this.classesService.thisYearClasses()[arrIndex];
    const destItem = destinationArr.find((el: any) => el === className)!;
    const destinationIndex = destinationArr.indexOf(destItem);

    const sourceArr = this.classesService.possibleClasses()[arrIndex];
    const sourceItem = sourceArr.find(
      (el: ActiveClass) => el.className === className,
    )!;
    const sourceIndex = sourceArr.indexOf(sourceItem);
    if (destItem) {
      this.removeFromArray(destinationArr, destinationIndex);
      this.addToArray(sourceArr, sourceItem);
    } else {
      this.removeFromArray(sourceArr, sourceIndex);
      this.addToArray(destinationArr, sourceItem);
    }

    destinationArr.sort();
    console.log('sourceArr', sourceArr);

    console.log('destinationArr', destinationArr);
  }

  addToArray(arr: ActiveClass[], item: ActiveClass) {
    arr.push(item);
    arr = this.classesService.sortItemsByClassName(arr);
  }

  removeFromArray(arr: ActiveClass[], index: number) {
    arr.splice(index, 1);
    arr = this.classesService.sortItemsByClassName(arr);
  }

  save() {
    console.log('SAVED');
    this.classesService.saveClasses();
  }
}
