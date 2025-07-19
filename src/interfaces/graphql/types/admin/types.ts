export interface LoginArgs {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  userId: string | null;
}
