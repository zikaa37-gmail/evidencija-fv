import { Student } from '../../students/students.interface';

export type AttendanceReason = 'absent' | 'equipment' | 'pity' | 'late' | 'ill';

export interface OptionItem {
  reason: AttendanceReason | null;
  label: string;
}

export interface AttendanceRecord {
  student_id: number;
  date: string;
  reason: AttendanceReason | null;
}

export const NOTE_TYPE = {
  GOOD: 'good',
  BAD: 'bad',
} as const;

export type NoteType = (typeof NOTE_TYPE)[keyof typeof NOTE_TYPE];

export interface StudentNote {
  id: number;
  student_id: number;
  date: string;
  type: NoteType;
  text: string;
  author_name: string | null;
  can_delete: boolean;
}

export interface NewNote {
  student: Student;
  date: string;
  type: NoteType;
  text: string;
}

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
