import { AuthenticationError } from 'apollo-server-errors';

export class LoginError extends AuthenticationError {
  constructor(message: string = 'Неправильний логін або пароль') {
    super(message);
  }
}
