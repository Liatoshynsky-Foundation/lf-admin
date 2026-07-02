import { createStore, type StoreApi } from 'zustand/vanilla';

import type { NavigationState } from '../types';
import { createNavigationSlice } from './navigationSlice';

describe('navigationSlice', () => {
  let store: StoreApi<NavigationState>;

  beforeEach(() => {
    store = createStore<NavigationState>()((...args) => createNavigationSlice(...args));
  });

  it('should initialize with default state', () => {
    const state = store.getState();
    expect(state.dirtyPaths).toEqual({});
    expect(state.pendingNavigation).toBeNull();
    expect(state.isDiscardModalOpen).toBe(false);
  });

  it('should set dirty path', () => {
    store.getState().setDirtyPath('/about', true);
    expect(store.getState().dirtyPaths['/about']).toBe(true);

    store.getState().setDirtyPath('/about', false);
    expect(store.getState().dirtyPaths['/about']).toBe(false);

    store.getState().setDirtyPath('/contact', true);
    expect(store.getState().dirtyPaths['/about']).toBe(false);
    expect(store.getState().dirtyPaths['/contact']).toBe(true);
  });

  it('should set pending navigation', () => {
    store.getState().setPendingNavigation('/new-route');
    expect(store.getState().pendingNavigation).toBe('/new-route');

    store.getState().setPendingNavigation(null);
    expect(store.getState().pendingNavigation).toBeNull();
  });

  it('should set discard modal open state', () => {
    store.getState().setDiscardModalOpen(true);
    expect(store.getState().isDiscardModalOpen).toBe(true);

    store.getState().setDiscardModalOpen(false);
    expect(store.getState().isDiscardModalOpen).toBe(false);
  });
});
