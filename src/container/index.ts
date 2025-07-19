import { AwilixContainer, createContainer } from 'awilix';

import { registerRepositories } from './modules/repositories';
import { registerUseCases } from './modules/use-cases';

export const createRequestContainer = (): AwilixContainer => {
  return createContainer().register({
    ...registerRepositories(),
    ...registerUseCases()
  });
};
