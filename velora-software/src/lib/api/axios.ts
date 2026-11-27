import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export const API_URL: string =
    import.meta.env.VITE_API_URL || "http://localhost:8000/";

const backendClient = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    withCredentials: true,
});

// ------------------------------------------------------------------
// CSRF
//
// Django checks an X-CSRFToken header on every session-authenticated
// write. The token is kept in memory (the backend returns it from
// csrf/, login/, register/ and me/), with the csrftoken cookie as a
// fallback. If a write is about to go out with no token, we fetch one
// first, and if Django still rejects it we refresh it and retry once.
// ------------------------------------------------------------------

let csrfToken: string | null = null;
let csrfRequest: Promise<string | null> | null = null;

const SAFE_METHODS = ["get", "head", "options"];

function readCookieToken(): string | null {
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function setCsrfToken(token: string | null | undefined): void {
    if (token) csrfToken = token;
}

export async function ensureCsrfToken(force = false): Promise<string | null> {
    if (!force && (csrfToken || readCookieToken())) {
        return csrfToken || readCookieToken();
    }
    if (!csrfRequest) {
        csrfRequest = axios
            .get<{ csrfToken: string }>("idn/api/auth/csrf/", {
                baseURL: API_URL,
                withCredentials: true,
            })
            .then(({ data }) => {
                csrfToken = data.csrfToken;
                return csrfToken;
            })
            .catch(() => null)
            .finally(() => {
                csrfRequest = null;
            });
    }
    return csrfRequest;
}

backendClient.interceptors.request.use(async (config) => {
    const method = (config.method || "get").toLowerCase();
    if (!SAFE_METHODS.includes(method)) {
        const token = await ensureCsrfToken();
        if (token) config.headers.set("X-CSRFToken", token);
    }
    return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _csrfRetried?: boolean };

backendClient.interceptors.response.use(
    (response) => {
        const data = response.data as { csrfToken?: string } | undefined;
        if (data && typeof data === "object" && "csrfToken" in data) {
            setCsrfToken(data.csrfToken);
        }
        return response;
    },
    async (error: AxiosError<{ detail?: string }>) => {
        const config = error.config as RetriableConfig | undefined;
        const detail = error.response?.data?.detail || "";
        if (
            config &&
            !config._csrfRetried &&
            error.response?.status === 403 &&
            /csrf/i.test(detail)
        ) {
            config._csrfRetried = true;
            const token = await ensureCsrfToken(true);
            if (token) config.headers.set("X-CSRFToken", token);
            return backendClient(config);
        }
        return Promise.reject(error);
    }
);

export default backendClient;
