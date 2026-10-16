export interface CurrentSchoolYear {
  id: number;
  name: string;
  starts_on: string;
  ends_on: string;
  preparation_starts_on: string;
  in_preparation: boolean;
  school: {
    id: number;
    name: string;
    city: string | null;
  };
}

export interface RolloverPreview {
  current_school_year: string;
  next_school_year: string;
  preparation_starts_on: string;
  ends_on: string;
  can_rollover: boolean;
  promotions: { from: string; to: string; students: number }[];
  graduating: { class: string; students: number }[];
  inactive_to_archive: number;
  first_grade_sections: number;
}

export interface ArchivedStudent {
  id: number;
  first_name: string;
  last_name: string;
  sex: 'male' | 'female';
  archived_at: string;
  last_class_name: string | null;
  last_school_year: string | null;
  completed: boolean;
}
