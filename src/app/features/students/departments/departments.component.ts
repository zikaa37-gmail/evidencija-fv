import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalService } from 'src/app/shared/services/global.service';
import { Section } from '../students.interface';
import { StudentsService } from '../students.service';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss']
})
export class DepartmentsComponent implements OnInit {
  @Output() selectedSection = new EventEmitter<Section[]>();
  sections: any[] = [];
  selectedSections: any[] = [];


  constructor(
    public globalService: GlobalService,
    private studentsService: StudentsService
  ) { }

  ngOnInit(): void {
    this.getPossibleSections();
    this.getSections();
  }

  getSections() {
    this.studentsService.getSections().subscribe(sections => {
      this.selectedSections = sections;

      this.selectedSections.forEach((row, index) => {
        row.forEach((section: any) => {
          this.filterSections(section.grade, section.department, index);
        });
      });
    });
  }

  getPossibleSections() {
    for (let i = 5; i <= 8; i++) {
      const arr: any[] = [];
      for (let j = 1; j <= 10; j++) {
        arr.push({ grade: i.toString(), department: j.toString() })
      }
      this.sections.push(arr);
    }
  }

  filterSections(grade: string, department: string, arrIndex: number) {
    const item: Section = { grade, department };
    const sourceArr = this.sections[arrIndex];
    const sourceItem = sourceArr.find((el: any) => el.department === item.department);
    const sourceIndex = sourceArr.indexOf(sourceItem);
    this.removeFromArray(sourceArr, sourceIndex);
  }

  onSectionSelect(grade: string, department: string, arrIndex: number) {
    const item: Section = { grade, department };

    const destinationArr = this.selectedSections[arrIndex];
    const destItem = destinationArr.find((el: any) => el.department === item.department);
    const destinationIndex = destinationArr.indexOf(destItem);

    const sourceArr = this.sections[arrIndex];
    const sourceItem = sourceArr.find((el: any) => el.department === item.department);
    const sourceIndex = sourceArr.indexOf(sourceItem);
    if (destItem) {
      this.removeFromArray(destinationArr, destinationIndex);
      this.addToArray(sourceArr, item);
    } else {
      this.removeFromArray(sourceArr, sourceIndex);
      this.addToArray(destinationArr, item);
    }

    console.log(sourceArr);
    destinationArr.sort();
  }

  addToArray(arr: Section[], item: Section) {
    arr.push(item);
    arr = this.sortByDepartment(arr)
  }

  removeFromArray(arr: Section[], index: number) {
    arr.splice(index, 1);
    arr = this.sortByDepartment(arr)

  }

  sortByDepartment(array: Section[]): any {//Section[]
    array.sort((a: Section, b: Section) => {
      if (a.department > b.department) return 1;
      if (a.department < b.department) return -1;
      // if (parseInt(a.department) > parseInt(b.department)) return 1;
      // if (parseInt(a.department) < parseInt(b.department)) return -1;
      return 0;
    })

  }

  save() {
    console.log('SAVED');
  }
}
