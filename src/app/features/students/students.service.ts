import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Section, Student } from './students.interface';
import { ErrorHandlerService } from 'src/app/shared/services/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private errorHandlerService = inject(ErrorHandlerService);

  sections = signal<Section[][]>([]);
  selectedSection = signal<Section>({
    grade: '5',
    department: '1',
  });
  possibleSections = signal<Section[][]>([]);
  thisYearSections = signal<Section[][]>([]);

  students = signal<Student[]>([]);
  filteredStudents = signal<Student[]>([]);

  constructor() {
    // this.getSections();
    this.getPossibleSections();
  }

  getSections(): void {
    //TODO
    this.http
      .get<any[]>(`${this.apiUrl}/sections`)
      .pipe(
        tap((sections) => this.sections.set(sections)),
        catchError((err) => {
          // TODO remove on api implementation
          this.sections.set(this.mockedSections());
          this.thisYearSections.set(this.mockedSections());

          return this.errorHandlerService.handleError(err);
        }),
      )
      .subscribe();
  }

  saveSections(): void {
    const sections: Section[] = this.thisYearSections().flat();

    this.http
      .post<Section[][]>(`${this.apiUrl}/sections`, sections)
      .pipe(
        tap((sections) => this.sections.set(sections)),
        tap((sections) => this.thisYearSections.set(sections)),
        catchError((err) => this.errorHandlerService.handleError(err)),
      )
      .subscribe();
  }

  updateSections(): void {
    const sections: Section[] = this.thisYearSections().flat();

    this.http
      .post<Section[][]>(`${this.apiUrl}/sections`, sections)
      .pipe(
        tap((sections) => this.sections.set(sections)),
        tap((sections) => this.thisYearSections.set(sections)),
        catchError((err) => this.errorHandlerService.handleError(err)),
      )
      .subscribe();
  }

  saveStudents(students: Student[]): void {
    const body = students.filter((s) => s.status === 'active')!;

    this.http
      .post<Student[]>(`${this.apiUrl}/students`, body)
      .pipe(
        tap((students) => this.students.set(students)),
        catchError((err) => this.errorHandlerService.handleError(err)),
      )
      .subscribe();
  }

  getAllStudents(): void {
    // return this.http.get(`${this.apiUrl}/students`)
    //   .pipe(
    //     tap((students: any) => this.studentsSubject.next(students))
    //   )
    // TODO get real data
    // const students = ;
    this.students.set(this.mockedStudents());
    this.filterStudents();
    // return of(this.mockedStudents());
  }

  getStudentsBySection() {
    const grade = this.selectedSection().grade;
    const department = this.selectedSection().department;
    const filteredStudents = this.students().filter(
      (student) =>
        student.section.grade === grade &&
        student.section.department === department,
    );
    this.filteredStudents.set(filteredStudents);
  }

  getPossibleSections(): void {
    let x = [];
    for (let i = 5; i <= 8; i++) {
      let arr: Section[] = [];
      for (let j = 1; j <= 10; j++) {
        arr.push({ grade: i.toString(), department: j.toString() });
        this.sortItemsByDepartment(arr);
      }
      x.push(arr);
    }
    this.possibleSections.set(x);
  }

  sortItemsByDepartment(arr: Section[]): Section[] {
    return arr.sort((a, b) => {
      return parseInt(a.department) - parseInt(b.department);
    });
  }

  mapStudentFromExcelData(row: any[]): Student {
    const student: Student = {} as Student;
    student.firstName = row[0];
    student.lastName = row[1];
    student.sex = row[2];
    student.section.grade = row[3].toString();
    student.section.department = row[4].toString();
    student.issues = row[5] || [];
    student.info.emergency.name = row[6];
    student.info.emergency.phone = row[7];
    student.info.departmentHead.name = row[8];
    student.info.departmentHead.phone = row[9];
    student.info.sports = row[10];
    student.status = row[11];
    return student;
  }

  filterStudents() {
    const section = this.selectedSection();

    const filteredStudents = this.students().filter(
      (student) =>
        student.section.grade === section.grade &&
        student.section.department === section.department,
    );
    this.filteredStudents.set(filteredStudents);
  }

  setSelectedSection(grade: string, department: string) {
    const section = { grade, department };
    this.selectedSection.set(section);
    this.filterStudents();
  }

  mockedSections = signal<Section[][]>([
    [
      { grade: '5', department: '1' },
      { grade: '5', department: '2' },
    ],
    [
      { grade: '6', department: '1' },
      { grade: '6', department: '2' },
    ],
    [
      { grade: '7', department: '1' },
      { grade: '7', department: '2' },
    ],
    [
      { grade: '8', department: '1' },
      { grade: '8', department: '2' },
      { grade: '8', department: '3' },
    ],
  ]);

  mockedStudents = signal<Student[]>([
    {
      id: null,
      firstName: 'Igor',
      lastName: 'Zivanovic',
      sex: 'male',
      section: {
        grade: '5',
        department: '1',
      },
      issues: [],
      info: {
        emergency: {
          name: 'Lidija Comagic',
          phone: '063/331050',
        },
        departmentHead: {
          name: 'Dominik Vilkins',
          phone: '069/2709207',
        },
        sports: ['basketball'],
      },
      status: 'active',
    },
    {
      id: null,
      firstName: 'Jovan',
      lastName: 'Peric',
      sex: 'male',
      section: {
        grade: '5',
        department: '1',
      },
      issues: [],
      info: {
        emergency: {
          name: 'Sofija Peric',
          phone: '063/331050',
        },
        departmentHead: {
          name: 'Dominik Vilkins',
          phone: '069/2709207',
        },
        sports: ['basketball', 'volleyball'],
      },
      status: 'active',
    },
    {
      id: null,
      firstName: 'Dejan',
      lastName: 'Simic',
      sex: 'male',
      section: {
        grade: '5',
        department: '1',
      },
      issues: ['head'],
      info: {
        emergency: {
          name: 'Jovan Simic',
          phone: '063/331050',
        },
        departmentHead: {
          name: 'Dominik Vilkins',
          phone: '069/2709207',
        },
        sports: ['basketball'],
      },
      status: 'inactive',
    },
    {
      id: null,
      firstName: 'Sima',
      lastName: 'Jankovic',
      sex: 'male',
      section: {
        grade: '5',
        department: '1',
      },
      issues: ['legs'],
      info: {
        emergency: {
          name: 'Danilo Jankovic',
          phone: '063/331050',
        },
        departmentHead: {
          name: 'Dominik Vilkins',
          phone: '069/2709207',
        },
        sports: ['soccer'],
      },
      status: 'active',
    },
    {
      id: null,
      firstName: 'Lidija',
      lastName: 'Petrovic',
      sex: 'male',
      section: {
        grade: '5',
        department: '1',
      },
      issues: [],
      info: {
        emergency: {
          name: 'Lidija Petrovic',
          phone: '063/331050',
        },
        departmentHead: {
          name: 'Dominik Vilkins',
          phone: '069/2709207',
        },
        sports: ['gymnastics'],
      },
      status: 'inactive',
    },
    {
      id: null,
      firstName: 'Vuk',
      lastName: 'Karas',
      sex: 'male',
      section: {
        grade: '5',
        department: '2',
      },
      issues: ['Astma'],
      info: {
        emergency: {
          name: 'Ana Karas',
          phone: '063/331050',
        },
        departmentHead: {
          name: 'Dominik Vilkins',
          phone: '069/2709207',
        },
        sports: ['basketball', 'fight'],
      },
      status: 'active',
    },
    {
      id: null,
      firstName: 'Petar',
      lastName: 'Prebicevic',
      sex: 'male',
      section: {
        grade: '5',
        department: '2',
      },
      issues: ['Astma'],
      info: {
        emergency: {
          name: 'Dejana Prebicevic',
          phone: '063/331050',
        },
        departmentHead: {
          name: 'Dominik Vilkins',
          phone: '069/2709207',
        },
        sports: ['basketball'],
      },
      status: 'active',
    },
  ]);
}
// }
