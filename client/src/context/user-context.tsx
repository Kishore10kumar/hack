import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  photo: string | null;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem("fatiguewatch_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setUser = (profile: UserProfile) => {
    localStorage.setItem("fatiguewatch_user", JSON.stringify(profile));
    setUserState(profile);
  };

  const logout = () => {
    localStorage.removeItem("fatiguewatch_user");
    setUserState(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
