import { createStore, type StoreApi } from 'zustand/vanilla';

import type { AdminUserState } from '../types';
import { createAdminSlice } from './adminSlice';

describe('adminSlice', () => {
  let store: StoreApi<AdminUserState>;

  beforeEach(() => {
    store = createStore<AdminUserState>()(createAdminSlice);
  });

  it('should initialize with default state', () => {
    const state = store.getState();
    expect(state.email).toBe('');
    expect(state.isLoggedIn).toBe(false);
    expect(state.canEdit).toBe(false);
    expect(state.isSuperAdmin).toBe(false);
    expect(state.admins).toEqual([]);
  });

  it('should handle login', () => {
    store.getState().login({
      email: 'admin@test.com',
      canEdit: true,
      isSuperAdmin: false
    });

    const state = store.getState();
    expect(state.email).toBe('admin@test.com');
    expect(state.isLoggedIn).toBe(true);
    expect(state.canEdit).toBe(true);
    expect(state.isSuperAdmin).toBe(false);
  });

  it('should handle logout', () => {
    store.getState().login({ email: 'test@test.com', canEdit: true, isSuperAdmin: true });
    store.getState().addAdmin({ email: 'other@test.com', canEdit: false });

    store.getState().logout();

    const state = store.getState();
    expect(state.email).toBe('');
    expect(state.isLoggedIn).toBe(false);
    expect(state.canEdit).toBe(false);
    expect(state.isSuperAdmin).toBe(false);
    expect(state.admins).toEqual([]);
  });

  it('should add a new admin if they do not exist', () => {
    const newAdmin = { email: 'new@test.com', canEdit: true };
    store.getState().addAdmin(newAdmin);

    expect(store.getState().admins).toHaveLength(1);
    expect(store.getState().admins[0]).toEqual(newAdmin);
  });

  it('should not add an admin if they already exist', () => {
    const admin = { email: 'exist@test.com', canEdit: true };
    store.getState().addAdmin(admin);
    store.getState().addAdmin(admin);

    expect(store.getState().admins).toHaveLength(1);
  });

  it('should remove an admin by email', () => {
    store.getState().addAdmin({ email: 'user1@test.com', canEdit: true });
    store.getState().addAdmin({ email: 'user2@test.com', canEdit: false });

    store.getState().removeAdmin('user1@test.com');

    const admins = store.getState().admins;
    expect(admins).toHaveLength(1);
    expect(admins[0]?.email).toBe('user2@test.com');
  });

  it('should update admin permission', () => {
    store.getState().addAdmin({ email: 'target@test.com', canEdit: false });
    store.getState().addAdmin({ email: 'other@test.com', canEdit: false });

    store.getState().updateAdminPermission('target@test.com', true);

    const admins = store.getState().admins;
    expect(admins.find((a) => a.email === 'target@test.com')?.canEdit).toBe(true);
    expect(admins.find((a) => a.email === 'other@test.com')?.canEdit).toBe(false);
  });
});
