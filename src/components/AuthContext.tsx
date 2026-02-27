"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";

type UserRole = "admin" | "user" | "client";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  userRole: UserRole;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const sessionUser = session?.user as { id: string; email: string; name: string } | undefined;

  // Get user role using user ID from session
  const userRoleResult = useQuery(
    api.auth.getUserRole,
    sessionUser?.id ? { userId: sessionUser.id } : "skip"
  );

  const user = sessionUser
    ? {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
      }
    : null;

  const userRole: UserRole = (userRoleResult as UserRole) ?? "user";

  const signOut = async () => {
    await authClient.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: sessionPending || userRoleResult === undefined,
        isAuthenticated: !!session,
        isAdmin: userRole === "admin",
        isClient: userRole === "client" || userRole === "admin",
        userRole,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
