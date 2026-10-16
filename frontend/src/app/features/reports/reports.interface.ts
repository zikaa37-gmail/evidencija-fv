import { Sex } from '../students/students.interface';
import { AttendanceReason, NoteType } from '../calendar/records/records.interface';

export type Period = 'month' | 'first-term' | 'second-term' | 'year';

export const REPORT_COLUMNS = ['absent', 'equipment', 'pity', 'late', 'ill'] as const;

export interface ReportRange {
  from: string;
  to: string;
}

export interface ReportCounts {
  absent: number;
  equipment: number;
  pity: number;
  late: number;
  ill: number;
  total: number;
  praises: number;
  warnings: number;
}

export interface ReportRow extends ReportCounts {
  student_id: number;
  first_name: string;
  last_name: string;
  sex: Sex;
  photo: string | null;
  status: 'active' | 'inactive';
}

export interface ClassReport extends ReportRange {
  class_name: string;
  students: ReportRow[];
}

export interface StudentReport extends ReportCounts, ReportRange {
  student_id: number;
  first_name: string;
  last_name: string;
  sex: Sex;
  photo: string | null;
  class_name: string;
  records: { date: string; reason: AttendanceReason }[];
  notes: { id: number; date: string; type: NoteType; text: string; author_name: string | null }[];
}
