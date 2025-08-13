import { StateCreator } from 'zustand';

import { AdminUserState } from '../types';

export const createAdminSlice: StateCreator<AdminUserState, [], [], AdminUserState> = (set, get) => ({
  email: '',
  isLoggedIn: false,
  canEdit: false,
  isSuperAdmin: false,

  admins: [],

  login: ({ email, canEdit, isSuperAdmin }) =>
    set({
      email,
      isLoggedIn: true,
      canEdit,
      isSuperAdmin
    }),

  logout: () =>
    set({
      email: '',
      isLoggedIn: false,
      canEdit: false,
      isSuperAdmin: false,
      admins: []
    }),

  addAdmin: (admin) => {
    const admins = get().admins;
    const exists = admins.some((a) => a.email === admin.email);
    if (!exists) {
      set({ admins: [...admins, admin] });
    }
  },

  removeAdmin: (email) => {
    set({ admins: get().admins.filter((a) => a.email !== email) });
  },

  updateAdminPermission: (email, canEdit) => {
    set({
      admins: get().admins.map((a) => (a.email === email ? { ...a, canEdit } : a))
    });
  }
});
