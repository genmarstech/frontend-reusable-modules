import axios from "axios";


const backendClient = axios.create({
    baseURL: 'http://localhost:8000/',
    timeout: 10000,
    withCredentials: true,
    // headers: {
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json'
    // },
})

export default backendClient