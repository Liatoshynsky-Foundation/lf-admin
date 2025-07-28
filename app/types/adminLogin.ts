export interface LoginSubmitData {
  login: string;
  password: string;
}

export interface LoginModalProps {
  onSubmit: (data: LoginSubmitData) => void;
}
