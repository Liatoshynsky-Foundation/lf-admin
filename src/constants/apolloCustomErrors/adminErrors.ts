import { AuthenticationError } from 'apollo-server-errors';

export class LoginError extends AuthenticationError {
  constructor() {
    super('Неправильний логін або пароль');
  }
}
