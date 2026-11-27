import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { getCurrentUser, LogoutUser } from "../lib/api/auth";
import { ensureCsrfToken } from "../lib/api/axios";
import type { AuthUser } from "../types/register.auth";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const checkSession = useCallback(async () => {
        try {
            const response = await getCurrentUser();
            setUser(response.authenticated ? response.user : null);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        // Make sure a CSRF token exists before any form can be submitted.
        ensureCsrfToken();
        getCurrentUser()
            .then((response) => {
                if (active) setUser(response.authenticated ? response.user : null);
            })
            .catch(() => {
                if (active) setUser(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const login = useCallback((userData: AuthUser) => {
        setUser(userData);
        setLoading(false);
    }, []);

    const logout = useCallback(async () => {
        try {
            await LogoutUser();
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({ user, loading, isAuthenticated: Boolean(user), login, logout, checkSession }),
        [user, loading, login, logout, checkSession]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
