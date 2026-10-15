export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  sex: Sex;
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

export enum StudentStatus {
  'ACTIVE' = 'active',
  'PENDING' = 'pending',
  'INACTIVE' = 'inactive',
}

export type Sex = 'male' | 'female';
