import { fn } from '@storybook/test';

export const mockExecute = fn();

export function resetContainerMock() {
  mockExecute.mockReset();
  mockExecute.mockResolvedValue(true);
}

export function createRootContainer() {
  return {
    resolve: () => ({ execute: mockExecute })
  };
}
