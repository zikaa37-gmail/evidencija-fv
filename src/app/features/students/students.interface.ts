export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  sex: 'male' | 'female';
  info: Info;
  status: StudentStatus;
  classNameId: string;
  className: string;
  schoolYearId: string;
  schoolYear: string;
  notes: {
    healthIssues: string[];
    negativeComments: string[];
    positiveComments: string[];
  };
}

export interface Info {
  emergency: NameNumber;
  departmentHead: NameNumber;
  sports: string[];
}

export interface NameNumber {
  name: string;
  phone: string;
}

// export interface Section {
//   grade: string;
//   department: string;
// }

export enum StudentStatus {
  'ACTIVE' = 'active',
  'PENDING' = 'pending',
  'INACTIVE' = 'inactive',
}

export enum Sexes {
  'MALE' = 'male',
  'FEMALE' = 'female',
}

export type Sex = 'male' | 'female';
