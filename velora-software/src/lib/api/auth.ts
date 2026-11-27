import backendClient from "./axios";
import type { Staff, StaffFormData } from "../../types/staff";
import type { Service, ServicePayload } from "../../types/services";
import type {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    SessionResponse,
} from "../../types/register.auth";
import type { Business } from "../../types/business";

// ------------------------------------------------------------------
// Identity
// ------------------------------------------------------------------

export const RegisterUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await backendClient.post<AuthResponse>("idn/api/auth/register/", payload);
    return data;
};

export const LoginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await backendClient.post<AuthResponse>("idn/api/auth/login/", payload);
    return data;
};

export const LogoutUser = async (): Promise<void> => {
    await backendClient.post("idn/api/auth/logout/");
};

export const getCurrentUser = async (): Promise<SessionResponse> => {
    const { data } = await backendClient.get<SessionResponse>("idn/api/auth/me/");
    return data;
};

// ------------------------------------------------------------------
// Businesses
// ------------------------------------------------------------------

export const createBusiness = async (payload: FormData): Promise<Business> => {
    const { data } = await backendClient.post<Business>("bn/business/", payload);
    return data;
};

export const getMyBusiness = async (): Promise<Business[]> => {
    const { data } = await backendClient.get<Business[]>("bn/business/");
    return data;
};

export const getBusiness = async (businessId: number): Promise<Business> => {
    const { data } = await backendClient.get<Business>(`bn/business/${businessId}/`);
    return data;
};

export const updateBusiness = async (
    businessId: number,
    payload: FormData | Partial<Business>
): Promise<Business> => {
    const { data } = await backendClient.patch<Business>(`bn/business/${businessId}/`, payload);
    return data;
};

// ------------------------------------------------------------------
// Services
// ------------------------------------------------------------------

export const createService = async (payload: ServicePayload): Promise<Service> => {
    const { data } = await backendClient.post<Service>("bn/services/", payload);
    return data;
};

export const getServices = async (businessId: number): Promise<Service[]> => {
    const { data } = await backendClient.get<Service[]>("bn/services/", {
        params: { business: businessId },
    });
    return data;
};

export const updateService = async (
    serviceId: number,
    payload: Partial<ServicePayload>
): Promise<Service> => {
    const { data } = await backendClient.patch<Service>(`bn/services/${serviceId}/`, payload);
    return data;
};

export const deleteService = async (serviceId: number): Promise<void> => {
    await backendClient.delete(`bn/services/${serviceId}/`);
};

// ------------------------------------------------------------------
// Staff
// ------------------------------------------------------------------

export const createStaff = async (businessId: number, payload: StaffFormData): Promise<Staff> => {
    const { data } = await backendClient.post<Staff>("bn/staff/", {
        ...payload,
        business: businessId,
    });
    return data;
};

export const getBusinessStaff = async (businessId: number): Promise<Staff[]> => {
    const { data } = await backendClient.get<Staff[]>("bn/staff/", {
        params: { business: businessId },
    });
    return data;
};

export const updateStaff = async (
    staffId: number,
    payload: Partial<StaffFormData>
): Promise<Staff> => {
    const { data } = await backendClient.patch<Staff>(`bn/staff/${staffId}/`, payload);
    return data;
};

export const deleteStaff = async (staffId: number): Promise<void> => {
    await backendClient.delete(`bn/staff/${staffId}/`);
};
