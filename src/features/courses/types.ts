export interface CourseAuthor {
  name: string;
  photo?: string | null;
}

export interface Course {
  id: number;
  user_id: number;
  title: string;
  cover?: string | null;
  description: string;
  created_at?: string;
  updated_at?: string;
  author?: CourseAuthor;
  students: number[];
  total_contents?: number;
  avg_ratings?: string | null;
}

export interface CourseContent {
  id: number;
  course_id: number;
  title: string;
  youtube: string;
  created_at?: string;
  updated_at?: string;
  my_status_finished: boolean;
}

export interface CourseRating {
  name: string;
  ratings: number;
  comment: string;
}

export interface CourseDetail extends Course {
  contents: CourseContent[];
  ratings: CourseRating[];
  my_percentage_finished: string;
}

export type MutationKey = "course" | "cover" | "student" | "rating" | "content";
