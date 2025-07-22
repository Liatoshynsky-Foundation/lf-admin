export interface LoginPayload {
  __typename: 'LoginPayload';
  success: boolean;
  adminId: string;
  adminType: string;
}

export interface ErrorPayload {
  __typename: 'ErrorPayload';
  success: boolean;
  message: string;
  statusCode: number;
}

export type LoginResult = LoginPayload | ErrorPayload;

export type LoginMutationResponse = {
  login: LoginResult;
};
