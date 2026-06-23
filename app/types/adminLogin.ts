export interface LoginSubmitData {
  login: string;
  password: string;
}

export interface LoginModalProps {
  onSubmit: (data: LoginSubmitData) => void;
  submitError?: string | null;
  loading?: boolean;
}
