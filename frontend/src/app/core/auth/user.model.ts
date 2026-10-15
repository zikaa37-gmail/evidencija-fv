export type UserRole = 'admin' | 'teacher';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  school_id: number | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
