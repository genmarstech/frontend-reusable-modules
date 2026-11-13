
export interface Staff {
    id: number;
    business: number;
    staff_name: string;
    staff_email: string;
    id_number: string;
    is_available: boolean;
    business_category: string;
    created_at: string;
    updated_at: string;
}

export interface StaffFormData {
    staff_name: string;
    staff_email: string;
    id_number: string;
    is_available: boolean;
}

export interface StaffApiError {
    staff_name?: string[];
    staff_email?: string[];
    id_number?: string[];
    business?: string[];
    is_available?: string[];
    non_field_errors?: string[];
}
