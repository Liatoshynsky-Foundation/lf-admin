import { AwilixContainer, createContainer } from 'awilix';

import { registerRepositories, RepositoriesModule } from './modules/repositories';
import { registerUseCases, UseCasesModule } from './modules/use-cases';

export type AwilixContainerType = AwilixContainer<RepositoriesModule & UseCasesModule>;

let container: AwilixContainerType | null = null;

export const createRootContainer = (): AwilixContainerType => {
  if (container) {
    return container;
  }

  container = createContainer();
  registerRepositories(container);
  registerUseCases(container);

  return container;
};

export const createRequestContainer = (): AwilixContainerType => {
  return createRootContainer().createScope();
};
