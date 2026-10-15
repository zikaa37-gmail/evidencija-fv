import { Student } from '../../students/students.interface';

export interface OptionItem {
  id: number;
  option: string;
  icon: string;
  selected: boolean;
  bgColor: 'primary' | 'accent' | 'warn' | 'success' | 'danger';
}

export const NOTE_TYPE = {
  GOOD: 'good',
  BAD: 'bad',
} as const;

export type NoteType = (typeof NOTE_TYPE)[keyof typeof NOTE_TYPE];

export interface Note {
  student: Student;
  note: string;
  type: NoteType;
}

export enum RecordOptions {
  'EQUIPMENT' = 'equipment',
  'PITY' = 'pity',
  'LATE' = 'late',
  'ILL' = 'ill',
  'ABSENT' = 'absent',
  'NONE' = 'none',
}
