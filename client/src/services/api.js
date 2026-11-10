import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ──────────────────────────────────────────────────────
// Inject JWT token into Authorization header if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────────────────────
// Normalize all error responses so every catch block can read err.customMessage.
// Backend validation errors return:
//   { success: false, message: '...', errors: { fieldName: 'message', ... } }
// We preserve the raw response so individual pages can read err.response.data.errors
// for per-field highlighting.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const responseData = error.response?.data;

    // Build a human-readable summary message
    let customMessage = responseData?.message || error.message || 'An unexpected error occurred';

    // If there are field-level errors, append a summary (but keep the response intact)
    if (responseData?.errors && typeof responseData.errors === 'object') {
      const fieldMessages = Object.entries(responseData.errors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(' | ');
      if (fieldMessages) {
        customMessage = `${customMessage} (${fieldMessages})`;
      }
    }

    return Promise.reject({
      ...error,
      customMessage,
      status: error.response?.status,
    });
  }
);

export default api;
