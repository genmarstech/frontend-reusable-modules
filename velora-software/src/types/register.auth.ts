export interface RegisterPayload {
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
}

export interface RegisterResponse {
    full_name: string;
    email: string;
    phone_number: string;
    created_at: string;
    updated_at: string;
}

