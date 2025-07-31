import { create } from 'zustand';

export interface Admin {
  email: string;
  canEdit: boolean;
}

interface AdminUserState {
  email: string;
  isLoggedIn: boolean;
  canEdit: boolean;
  isSuperAdmin: boolean;

  admins: Admin[];

  login: (data: { email: string; canEdit: boolean; isSuperAdmin: boolean }) => void;
  logout: () => void;

  addAdmin: (admin: Admin) => void;
  removeAdmin: (email: string) => void;
  updateAdminPermission: (email: string, canEdit: boolean) => void;
}

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
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
}));
