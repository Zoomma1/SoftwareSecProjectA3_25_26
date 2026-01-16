import { createContext, useContext, type ReactNode } from "react";

interface AuthContextType {
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    // We intentionally preserve "remember_email" so the user doesn't have to re-type it
  };

  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}