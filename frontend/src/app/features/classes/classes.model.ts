export interface ClassSlot {
  name: string;
  grade: number;
  section: number;
}

export interface SchoolClass extends ClassSlot {
  id: number;
  head_teacher_name: string | null;
  head_teacher_phone: string | null;
  students_count: number;
}
