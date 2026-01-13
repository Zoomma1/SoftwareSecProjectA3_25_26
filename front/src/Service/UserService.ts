import { AuthService } from "./AuthService";
import { UserModel } from "../types/User";

let currentUser: UserModel | null = null;

export const UserService = {
  // Asynchronously load current user from backend and cache it
  loadCurrentUser: async (): Promise<UserModel | null> => {
    try {
      const resp = await AuthService.apiCall("/users/me");
      if (!resp) return null;
      if (!resp.ok) {
        console.warn("UserService.loadCurrentUser: non-ok response", resp.status);
        return null;
      }
      const data = await resp.json();
      currentUser = UserModel.fromApi(data);
      return currentUser;
    } catch (e) {
      console.warn("UserService.loadCurrentUser failed:", e);
      return null;
    }
  },

  // Synchronous getter for cached user (may be null if not loaded)
  getCurrentUser: (): UserModel | null => {
    return currentUser;
  },

  // Clear cached user (e.g. on logout)
  clear: () => {
    currentUser = null;
  },
};
