"use client";

import { create } from "zustand";
import { AuthUser, UserRole } from "@/types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isLoading: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,
  isLoading: true,

  setAuth: (user: AuthUser, token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("siet_access_token", token);
      localStorage.setItem("siet_user", JSON.stringify(user));
    }
    set({
      user,
      token,
      isAuthenticated: true,
      role: user.role,
      isLoading: false,
    });
  },

  updateUser: (updatedFields: Partial<AuthUser>) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updatedFields };
      if (typeof window !== "undefined") {
        localStorage.setItem("siet_user", JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("siet_access_token");
      localStorage.removeItem("siet_user");
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
      isLoading: false,
    });
  },

  initialize: () => {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("siet_access_token");
        const storedUser = localStorage.getItem("siet_user");

        if (token && storedUser) {
          const user = JSON.parse(storedUser) as AuthUser;
          set({
            user,
            token,
            isAuthenticated: true,
            role: user.role,
            isLoading: false,
          });
          return;
        }
      } catch (e) {
        console.error("Failed to parse stored auth", e);
      }
    }
    set({ isLoading: false });
  },
}));
