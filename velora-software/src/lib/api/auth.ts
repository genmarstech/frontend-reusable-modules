import backendClient from "./axios";


export const RegisterUser = async(payload) => {
    const response = await backendClient.post('idn/api/auth/register/', payload)

    return response.data
}

export const LoginUser = async(payload) => {
    const response = await backendClient.post('idn/api/auth/login/', payload)

    return response.data
}

export const getCurrentUser = async () => {
    const response = await backendClient.get('idn/api/auth/me/')

    return response.data
}



export const createBusiness = async (payload) => {
    const csrfToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="))
        ?.split("=")[1];

    if (!csrfToken) {
        throw new Error("CSRF token not found.");
    }

    const response = await backendClient.post(
        "bn/business/",
        payload,
        {
            headers: {
                "X-CSRFToken": csrfToken,
            },
        }
    );

    return response.data;
};


