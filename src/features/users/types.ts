export interface UserProfile {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  created_at?: string;
  updated_at?: string;
}
