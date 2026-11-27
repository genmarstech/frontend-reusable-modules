import backendClient from "./axios";
import type { CustomerBookings, CustomerSession } from "../../types/customers";

// Customer accounts on a business's booking link. The session cookie is
// shared with the rest of the app; the backend keeps the customer separate
// from any business-owner login in the same browser.

export const getCustomerSession = async (business?: string) =>
    (await backendClient.get<CustomerSession>("cu/session/", { params: business ? { business } : {} })).data;

export interface CustomerRegisterPayload {
    business: string;
    full_name: string;
    phone_number: string;
    email?: string;
    password: string;
}

export const registerCustomer = async (payload: CustomerRegisterPayload) =>
    (await backendClient.post<CustomerSession>("cu/register/", payload)).data;

export const loginCustomer = async (payload: { business?: string; phone_number: string; password: string }) =>
    (await backendClient.post<CustomerSession>("cu/login/", payload)).data;

export const logoutCustomer = async () => (await backendClient.post<CustomerSession>("cu/logout/")).data;

export const joinBusiness = async (business: string) =>
    (await backendClient.post<CustomerSession>("cu/join/", { business })).data;

export const updateCustomerProfile = async (business: string, payload: { full_name?: string; email?: string }) =>
    (await backendClient.patch<CustomerSession>("cu/session/", payload, { params: { business } })).data;

export const getMyBookings = async (business: string) =>
    (await backendClient.get<CustomerBookings>("cu/bookings/", { params: { business } })).data;
