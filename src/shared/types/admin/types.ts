export interface LoginArgs {
  email: string;
  password: string;
}

export interface RequestResetArgs {
  email: string;
}

export interface ResetPasswordArgs {
  token: string;
  password: string;
}
