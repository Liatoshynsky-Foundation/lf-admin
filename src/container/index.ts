import { AwilixContainer, createContainer } from 'awilix';

import { registerRepositories } from './modules/repositories';
import { registerUseCases } from './modules/use-cases';

let container: AwilixContainer | null = null;

export const createRequestContainer = (): AwilixContainer => {
  container ??= createContainer().register({
    ...registerRepositories(),
    ...registerUseCases()
  });
  return container;
};
