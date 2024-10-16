import { Student } from '../../students/students.interface';

export interface Record {
  id: string | number;
  studentId: string | number;
  reason: RecordOptions;
  note: {
    type: NoteTypes;
    text: string;
  };
  recordDate: Date;
}

export interface OptionItem {
  id: string | number;
  option: string;
  icon: string;
  selected: boolean;
  bgColor: 'primary' | 'accent';
}

export interface Note {
  student: Student;
  note: string;
  type: string;
}

export enum RecordOptions {
  'EQUIPMENT' = 'equipment',
  'PITY' = 'pity',
  'LATE' = 'late',
  'ILL' = 'ill',
  'ABSENT' = 'absent',
  'NONE' = 'none',
}

export enum NoteTypes {
  'POSITIVE' = 'positive',
  'NEGATIVE' = 'negative',
}

export const NOTETYPE = {
  GOOD: 'good',
  BAD: 'bad',
};
