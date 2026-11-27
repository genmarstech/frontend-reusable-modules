export interface RegisterPayload {
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthUser {
    id: number;
    email: string;
    name: string;
    phone_number?: string;
}

export interface AuthResponse {
    message: string;
    authenticated: boolean;
    user: AuthUser;
    csrfToken?: string;
}

export interface SessionResponse {
    authenticated: boolean;
    user: AuthUser | null;
    csrfToken?: string;
}
