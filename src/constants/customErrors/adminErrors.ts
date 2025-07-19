import { AuthenticationError } from 'apollo-server-errors';

export class LoginError extends AuthenticationError {
  constructor() {
    super('Не правильний логін або пароль');
  }
}
