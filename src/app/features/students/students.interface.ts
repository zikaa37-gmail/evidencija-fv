export interface Student {
  id: string | number | null;
  firstName: string;
  lastName: string;
  sex: Sex; // string; // Sexes;
  section: Section;
  issues: string[];
  info: Info;
  status: string; //Statuses;
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

export interface Section {
  grade: string;
  department: string;
}

export enum Statuses {
  'ACTIVE' = 'active',
  'PENDING' = 'pending',
  'INACTIVE' = 'inactive',
}

export enum Sexes {
  'MALE' = 'male',
  'FEMALE' = 'female',
}

export type Sex = 'male' | 'female';
