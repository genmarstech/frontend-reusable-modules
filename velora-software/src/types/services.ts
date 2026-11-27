export interface Service {
    id: number;
    business: number;
    service_name: string;
    service_description: string | null;
    price: string;
    duration_minutes: number;
    buffer_before_minutes: number;
    buffer_after_minutes: number;
    deposit_amount: string | null;
    resource: number | null;
    is_available: boolean;
    business_category: string;
    created_at: string;
    updated_at: string;
}

export interface ServicePayload {
    business: number;
    service_name: string;
    service_description: string;
    price: string;
    duration_minutes: number;
    buffer_before_minutes?: number;
    buffer_after_minutes?: number;
    deposit_amount?: string | null;
    resource?: number | null;
    is_available: boolean;
}
