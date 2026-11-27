export interface Business {
    id: number;
    business_name: string;
    business_description: string;
    business_category: string;
    business_category_label?: string;
    whatsapp_number: string;
    business_email: string;
    business_logo: string | null;
    number_of_service_users?: number;
    created_at: string;
    updated_at: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
    SC: "Salon",
    BSC: "Barbershop",
    SP: "Spa",
    BCC: "Beauty Clinic",
    SPC: "Beauty Professional",
};
