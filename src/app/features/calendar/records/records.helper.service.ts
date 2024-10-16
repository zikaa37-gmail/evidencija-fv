import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Sexes, Statuses, Student } from "../../students/students.interface";
import { OptionItem, RecordOptions } from "./records.interface";

@Injectable({ providedIn: 'root' })
export class RecordsHelperService {
  options = RecordOptions;
  sexes = Sexes;
  statuses = Statuses;

  constructor(private translate: TranslateService) { }

  getOptions(): OptionItem[] {
    return [
      { id: 1, option: this.options.EQUIPMENT, icon: 'fa fa-shirt', selected: false },
      { id: 2, option: this.options.PITY, icon: 'fa fa-venus', selected: false },
      { id: 3, option: this.options.LATE, icon: 'fa fa-clock', selected: false },
      { id: 4, option: this.options.ILL, icon: 'fa fa-square-plus', selected: false },
      { id: 4, option: this.options.ABSEND, icon: 'fa fa-minus', selected: false },
      { id: 4, option: this.options.NONE, icon: 'fa fa-close', selected: false }
    ]
  }

  getStudents(): Student[] {
    return [
      {
        id: 1,
        firstName: 'Petar',
        lastName: 'Zivanovic',
        sex: 'SEXES.MALE',
        section: {
          grade: '7',
          department: '3'
        },
        issues: [],
        info: {
          emergency: {
            name: 'Igor Zivanovic',
            phone: '+38163331030'
          },
          departmentHead: {
            name: 'Jovan Memedovic',
            phone: '265456554645'
          },
          sports: [this.translate.instant('SPORTS.BASKETBALL')]
        },
        status: this.statuses.ACTIVE
      },
      {
        id: 2,
        firstName: 'Vuk',
        lastName: 'Zivanovic',
        sex: 'SEXES.MALE',
        section: {
          grade: '5',
          department: '2'
        },
        issues: ['HEART'],
        info: {
          emergency: {
            name: 'Igor Zivanovic',
            phone: '+38163331030'
          },
          departmentHead: {
            name: 'Slavko Tatic',
            phone: '658854841'
          },
          sports: [this.translate.instant('SPORTS.BASKETBALL')]
        },
        status: this.statuses.ACTIVE
      },
      {
        id: 3,
        firstName: 'Lidija',
        lastName: 'Comagic Zivanovic',
        sex: 'SEXES.MALE',
        section: {
          grade: '5',
          department: '2'
        },
        issues: ['HEAD', 'LEGS'],
        info: {
          emergency: {
            name: 'Igor Zivanovic',
            phone: '+38163331030'
          },
          departmentHead: {
            name: 'Srecko Susic',
            phone: '324322432'
          },
          sports: [
            this.translate.instant('SPORTS.GYMNASTICS'),
            this.translate.instant('SPORTS.VOLLEYBALL')
          ]
        },
        status: this.statuses.ACTIVE
      }
    ]
  }
}
