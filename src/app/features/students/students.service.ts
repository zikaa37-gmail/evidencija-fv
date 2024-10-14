import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Section, Student } from './students.interface';

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  apiUrl = environment.apiUrl;
  sectionsSubject = new BehaviorSubject<Section[]>([]);
  sections$ = this.sectionsSubject.asObservable();

  selectedSectionSubject = new BehaviorSubject<Section>({
    grade: '5',
    department: '1'
  });
  selectedSection$ = this.selectedSectionSubject.asObservable();

  studentsSubject = new BehaviorSubject<Student[]>([]);
  students$ = this.studentsSubject.asObservable();

  filteredStudentsSubject = new BehaviorSubject<Student[]>([]);
  filteredStudents$ = this.filteredStudentsSubject.asObservable();

  constructor(private http: HttpClient) { }

  getSections(): Observable<any[]> {
    //TODO
    // return this.http.get<any[]>(`${this.apiUrl}/sections`);
    return of([
      [{ grade: '5', department: '1' }, { grade: '5', department: '2' }],
      [{ grade: '6', department: '1' }, { grade: '6', department: '2' }],
      [{ grade: '7', department: '1' }, { grade: '7', department: '2' }],
      [{ grade: '8', department: '1' }, { grade: '8', department: '2' }, { grade: '8', department: '3' }],
    ])
  }

  saveSections(sections: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sections`, sections)
      .pipe(
        tap(sections => this.sectionsSubject.next(sections))
      );
  }

  updateSections(sections: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/sections`, sections);
  }

  saveStudents(students: Student[]): Observable<any> {
    const body = students.filter(s => s.status === 'active')!;
    // return
    this.http.post<Student[]>(`${this.apiUrl}/students`, body).pipe(
      tap(students => this.studentsSubject.next(students))

    );
    return of(true);
  }

  getStudents(): Observable<any> {
    // return this.http.get(`${this.apiUrl}/students`)
    //   .pipe(
    //     tap((students: any) => this.studentsSubject.next(students))
    //   )
    const students = this.getMockedStudents();
    this.studentsSubject.next(students);
    this.filterStudents();
    return of(students);
  }

  mapStudentFromExcelData(row: any[]): Student {
    const student: Student = new Student();
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
    const students = this.studentsSubject.getValue();
    const section = this.selectedSectionSubject.getValue();

    const filteredStudents = students.filter(
      student =>
        student.section.grade === section.grade
        &&
        student.section.department === section.department);
    this.filteredStudentsSubject.next(filteredStudents);
  }

  setSelectedSection(grade: string, department: string) {
    const section = { grade, department };
    this.selectedSectionSubject.next(section);
    // this.selectedSection.grade = grade;
    // this.selectedSection.department = department;
    this.filterStudents();
  }

  // findStudent(student: Student): Student{

  // }

  getMockedStudents(): Student[] {

    return [
      {
        'id': null,
        'firstName': 'Igor',
        'lastName': 'Zivanovic',
        'sex': 'male',
        'section': {
          'grade': '5',
          'department': '1'
        },
        'issues': [],
        'info': {
          'emergency': {
            'name': 'Lidija Comagic',
            'phone': '063/331050'
          },
          'departmentHead': {
            'name': 'Dominik Vilkins',
            'phone': '069/2709207'
          },
          'sports': ['basket']
        },
        'status': 'active'
      },
      {
        'id': null,
        'firstName': 'Jovan',
        'lastName': 'Peric',
        'sex': 'male',
        'section': {
          'grade': '5',
          'department': '1'
        },
        'issues': [],
        'info': {
          'emergency': {
            'name': 'Sofija Peric',
            'phone': '063/331050'
          },
          'departmentHead': {
            'name': 'Dominik Vilkins',
            'phone': '069/2709207'
          },
          'sports': ['basket']
        },
        'status': 'active'
      },
      {
        'id': null,
        'firstName': 'Dejan',
        'lastName': 'Simic',
        'sex': 'male',
        'section': {
          'grade': '5',
          'department': '1'
        },
        'issues': ['head'],
        'info': {
          'emergency': {
            'name': 'Jovan Simic',
            'phone': '063/331050'
          },
          'departmentHead': {
            'name': 'Dominik Vilkins',
            'phone': '069/2709207'
          },
          'sports': ['basket']
        },
        'status': 'inactive'
      },
      {
        'id': null,
        'firstName': 'Sima',
        'lastName': 'Jankovic',
        'sex': 'male',
        'section': {
          'grade': '5',
          'department': '1'
        },
        'issues': ['legs'],
        'info': {
          'emergency': {
            'name': 'Danilo Jankovic',
            'phone': '063/331050'
          },
          'departmentHead': {
            'name': 'Dominik Vilkins',
            'phone': '069/2709207'
          },
          'sports': ['basket']
        },
        'status': 'active'
      },
      {
        'id': null,
        'firstName': 'Lidija',
        'lastName': 'Petrovic',
        'sex': 'male',
        'section': {
          'grade': '5',
          'department': '1'
        },
        'issues': [],
        'info': {
          'emergency': {
            'name': 'Lidija Petrovic',
            'phone': '063/331050'
          },
          'departmentHead': {
            'name': 'Dominik Vilkins',
            'phone': '069/2709207'
          },
          'sports': ['basket']
        },
        'status': 'inactive'
      },
      {
        'id': null,
        'firstName': 'Vuk',
        'lastName': 'Karas',
        'sex': 'male',
        'section': {
          'grade': '5',
          'department': '2'
        },
        'issues': ['Astma'],
        'info': {
          'emergency': {
            'name': 'Ana Karas',
            'phone': '063/331050'
          },
          'departmentHead': {
            'name': 'Dominik Vilkins',
            'phone': '069/2709207'
          },
          'sports': ['basket']
        },
        'status': 'active'
      },
      {
        'id': null,
        'firstName': 'Petar',
        'lastName': 'Prebicevic',
        'sex': 'male',
        'section': {
          'grade': '5',
          'department': '2'
        },
        'issues': ['Astma'],
        'info': {
          'emergency': {
            'name': 'Dejana Prebicevic',
            'phone': '063/331050'
          },
          'departmentHead': {
            'name': 'Dominik Vilkins',
            'phone': '069/2709207'
          },
          'sports': ['basket']
        },
        'status': 'active'
      }
    ];

  }
}
