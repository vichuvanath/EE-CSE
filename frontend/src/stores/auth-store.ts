import { create } from "zustand";
import { AuthUser, UserRole } from "@/types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => void;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    if (typeof window === "undefined") return;

    try {
      const token = localStorage.getItem("siet_access_token");
      const userStr = localStorage.getItem("siet_user");

      if (token && userStr) {
        const parsedUser = JSON.parse(userStr) as AuthUser;
        set({
          accessToken: token,
          user: parsedUser,
          role: parsedUser.role,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          accessToken: null,
          user: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch {
      set({
        accessToken: null,
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setAuth: (user: AuthUser, token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("siet_access_token", token);
      localStorage.setItem("siet_user", JSON.stringify(user));
    }
    set({
      user,
      accessToken: token,
      role: user.role,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("siet_access_token");
      localStorage.removeItem("siet_user");
    }
    set({
      user: null,
      accessToken: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
