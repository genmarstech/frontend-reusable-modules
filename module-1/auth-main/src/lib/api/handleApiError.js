import axios from "axios";

export const handleApiError = (error) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with an error status
      return {
        message:
          error.response.data?.message ||
          error.response.data?.detail ||
          'The request could not be completed.',
        status: error.response.status,
        errors: error.response.data,
      }
    }

    if (error.request) {
      // Request was sent but no response received
      return {
        message: 'Unable to reach the server. Check your connection.',
        status: null,
        errors: null,
      }
    }
  }

  return {
    message: error.message || 'An unexpected error occurred.',
    status: null,
    errors: null,
  }
}