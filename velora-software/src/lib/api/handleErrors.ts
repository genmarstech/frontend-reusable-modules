import axios from "axios";

export interface ApiError {
    message: string;
    status: number | null;
    errors: Record<string, unknown> | null;
}

function firstMessage(value: unknown): string | null {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && value.length) return firstMessage(value[0]);
    return null;
}

export const handleApiError = (error: unknown): ApiError => {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            const data = error.response.data as Record<string, unknown> | undefined;
            const fieldMessage =
                data && typeof data === "object"
                    ? Object.entries(data)
                          .filter(([key]) => !["code", "csrfToken"].includes(key))
                          .map(([, value]) => firstMessage(value))
                          .find(Boolean)
                    : null;
            return {
                message:
                    firstMessage(data?.message) ||
                    firstMessage(data?.detail) ||
                    firstMessage(data?.error) ||
                    fieldMessage ||
                    "The request could not be completed.",
                status: error.response.status,
                errors: data && typeof data === "object" ? data : null,
            };
        }

        if (error.request) {
            return {
                message: "Unable to reach the server. Check your connection.",
                status: null,
                errors: null,
            };
        }
    }

    return {
        message:
            error instanceof Error && error.message
                ? error.message
                : "An unexpected error occurred.",
        status: null,
        errors: null,
    };
};

/** Flatten DRF field errors to `{ field: "message" }`. */
export function fieldErrorsFrom(error: unknown): Record<string, string> {
    const { errors } = handleApiError(error);
    const result: Record<string, string> = {};
    if (!errors) return result;
    Object.entries(errors).forEach(([field, value]) => {
        const message = firstMessage(value);
        if (message) result[field] = message;
    });
    return result;
}
