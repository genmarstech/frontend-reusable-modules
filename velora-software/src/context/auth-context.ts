import { createContext, useContext } from "react";
import type { AuthUser } from "../types/register.auth";

export interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (user: AuthUser) => void;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
    const value = useContext(AuthContext);
    if (!value) {
        throw new Error("useAuth must be used inside <AuthProvider>.");
    }
    return value;
}
