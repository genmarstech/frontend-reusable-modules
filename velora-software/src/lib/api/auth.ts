import backendClient from "./axios";
import type { Staff, StaffFormData } from "../../types/staff";
import type { Service } from "../../types/services";
import type { RegisterResponse, Login, RegisterPayload } from "../../types/register.auth";
import type { Business } from "../../types/business";



export const RegisterUser = async (
    payload: RegisterPayload | Record<string, unknown>
): Promise<RegisterResponse> => {
    const { data } = await backendClient.post<RegisterResponse>(
        'idn/api/auth/register/',
        payload
    )

    return data
}

export const LoginUser = async (
    payload: FormData | Record<string, unknown>
): Promise<Login> => {
    const { data } = await backendClient.post<Login>('idn/api/auth/login', payload)

    return data
}

export const getCurrentUser = async () => {
    const response = await backendClient.get('idn/api/auth/me/')

    return response.data
}



export const createBusiness = async (payload: FormData | Record<string, unknown>): Promise<Business> => {
    const csrfToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="))
        ?.split("=")[1];

    if (!csrfToken) {
        throw new Error("CSRF token not found.");
    }

    const { data } = await backendClient.post<Business>(
        'bn/business',
        payload,
        {
            headers: {
                "X-CSRFToken": decodeURIComponent(csrfToken)
            }
        }
    )

    return data;
};


export const createService = async (
    payload: FormData | Record<string, unknown>
): Promise<Service> => {

    const csrfToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="))
        ?.split("=")[1];

    if (!csrfToken) {
        throw new Error("CSRF token not found.");
    }

    const response = await backendClient.post<Service>(
        "/bn/services/",
        payload,
        {
            headers: {
                "X-CSRFToken": decodeURIComponent(csrfToken),
            },
        }
    );

    return response.data;
};


export const getServices = async (
    businessId: number
): Promise<Service[]> => {

    const response = await backendClient.get<Service[]>(
        `/bn/services/?business=${businessId}`
    );

    return response.data;
};

export const getMyBusiness = async () => {
    const response = await backendClient.get('bn/business/')

    return response.data
}


export const createStaff = async (
    businessId: number,
    payload: StaffFormData
): Promise<Staff> => {

    const csrfToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="))
        ?.split("=")[1];

    if (!csrfToken) {
        throw new Error("CSRF token not found.");
    }

    const response = await backendClient.post<Staff>(
        "/bn/staff/",
        {
            ...payload,
            business: businessId,
        },
        {
            headers: {
                "X-CSRFToken": decodeURIComponent(csrfToken),
            },
            withCredentials: true,
        }
    );

    return response.data;
};

export const getBusinessStaff = async (
    businessId: number
): Promise<Staff[]> => {
    const response = await backendClient.get<Staff[]>(
        `/bn/staff/?business=${businessId}`
    );

    return response.data;
};
