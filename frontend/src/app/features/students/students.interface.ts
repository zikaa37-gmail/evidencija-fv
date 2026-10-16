export type Sex = 'male' | 'female';

export enum StudentStatus {
  'ACTIVE' = 'active',
  'INACTIVE' = 'inactive',
}

export interface StudentFields {
  first_name: string;
  last_name: string;
  sex: Sex;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  sports: string[];
  health_issues: string[];
}

export interface Student extends StudentFields {
  id: number;
  status: StudentStatus;
  school_class_id: number;
  class_name: string;
  head_teacher_name: string | null;
  head_teacher_phone: string | null;
  photo: string | null;
}

export interface StudentPayload extends StudentFields {
  school_class_id: number;
  photo: string | null;
}

export interface StudentImportRow extends StudentFields {
  class_name: string;
}

export interface ImportSummary {
  created: number;
  updated: number;
}
