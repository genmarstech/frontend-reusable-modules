
import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";
import { getCurrentUser } from "../lib/api/auth";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = async () => {
    try {
        const response = await getCurrentUser();

        // Check the authenticated flag from your view
        if (response && response.authenticated) {
            setUser(response.user);
        } else {
            setUser(null);
        }
    } catch (error) {
        setUser(null);
    } finally {
        setLoading(false); // Only stop loading after we are certain of the state
    }
};


    useEffect(() => {
        checkSession();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: Boolean(user),
                login,
                logout,
                checkSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
