import api from "./axios";

// create axios instance services here.

export const RegisterUser = async (payload) => {
    const response = await api.post('/idn/api/auth/register/', payload)

    return response.data
    
}

export const LoginUser = async (payload) => {
    const response = await api.post('/idn/api/auth/login/', payload)

    return response.data
    
}
