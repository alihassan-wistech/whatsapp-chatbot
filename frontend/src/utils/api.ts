import axios, { AxiosRequestConfig, AxiosError } from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

/**
 * Creates a generic Axios request wrapper.
 * This is the central function for all API calls.
 * * @param endpoint The API path (e.g., '/chatbots').
 * @param method The HTTP method ('get', 'post', 'put', 'delete', etc.).
 * @param data The request body data (for POST, PUT, PATCH).
 * @param config Optional Axios configuration overrides.
 * @returns Parsed JSON response data.
 */
async function apiRequest(
  endpoint: string,
  method: AxiosRequestConfig["method"] = "GET",
  data: any = null,
  config: AxiosRequestConfig = {}
): Promise<any> {
  const token = getAuthToken();

  const requestConfig: AxiosRequestConfig = {
    url: `${API_BASE_URL}${endpoint}`,
    method: method,
    data: data,
    ...config, // Merge optional configuration
    headers: {
      Accept: "application/json",
      // Axios defaults Content-Type header correctly based on the 'data' passed
      ...(token && { Authorization: `Bearer ${token}` }),
      ...config.headers,
    },
  };

  try {
    const response = await axios.request(requestConfig);

    // --- START OF TOKEN RENEWAL LOGIC ---
    // Axios provides reliable access to response headers.
    console.log("API response headers: ", response.headers);
    const newToken = response.headers["x-new-auth-token"];
    if (newToken) {
      localStorage.setItem("auth_token", newToken);
      console.log("Authentication token renewed successfully.");
    }
    // --- END OF TOKEN RENEWAL LOGIC ---

    // Axios returns the data property directly if the status code is 2xx
    // It automatically handles 204 No Content by returning undefined/null data
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = axiosError.response.status;
      const responseData = axiosError.response.data as any;

      let errorMessage = "An unexpected error occurred.";

      // Prioritize Laravel validation/API error message
      if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.error) {
        errorMessage = responseData.error;
      }

      // Throw a specific error for better catch handling in the component
      throw new Error(`[${status}] ${errorMessage}`);
    } else if (axiosError.request) {
      // The request was made but no response was received (e.g., network error)
      throw new Error(`[Network Error] No response received.`);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`[Client Error] ${axiosError.message}`);
    }
  }
}

// ===============================================
// AUTHENTICATION
// ===============================================

export async function signup(email: string, password: string, name: string) {
  return apiRequest("/auth/signup", "POST", { email, password, name });
}

export async function login(email: string, password: string) {
  const response = await apiRequest("/auth/login", "POST", { email, password });

  // Save token upon successful login (initial token is usually in the body)
  if (response.token) {
    localStorage.setItem("auth_token", response.token);
  }

  return response;
}

export async function logout() {
  // Optional: Call a server-side logout endpoint here if one exists
  localStorage.removeItem("auth_token");
}

/**
 * Performs a secure, server-side check of the Sanctum token's validity.
 * This is the correct method, replacing the insecure client-side JWT decoding.
 */
export async function getSession() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    // Attempt to fetch user data. A 401 response is handled by apiRequest's error chain.
    const userData = await apiRequest("/user", "GET");

    // If successful, userData contains the authenticated user's profile
    return { user: userData };
  } catch (error) {
    // If apiRequest throws (e.g., 401 Unauthorized), we know the token is bad.
    // The error handler in apiRequest should ideally clear the token for us,
    // but we can ensure it here just in case of an invalid token response not explicitly caught.
    if ((error as Error).message.includes("[401]")) {
      localStorage.removeItem("auth_token");
    }
    return null;
  }
}

// ===============================================
// CHATBOTS CRUD
// ===============================================

export async function getChatbots(): Promise<any> {
  // Returns an array of chatbots wrapped in a 'data' key from the Laravel Resource
  return apiRequest("/chatbots", "GET");
}

export async function getChatbot(id: string): Promise<any> {
  // Returns a single chatbot object wrapped in a 'data' key
  return apiRequest(`/chatbots/${id}`, "GET");
}

export async function createChatbot(data: any): Promise<any> {
  // data includes name, description, questions[], and formConfig{}
  return apiRequest("/chatbots", "POST", data);
}

export async function updateChatbot(id: string, data: any): Promise<any> {
  // Use 'PUT' to send the full updated resource body
  return apiRequest(`/chatbots/${id}`, "PUT", data);
}

export async function deleteChatbot(id: string): Promise<any> {
  // Backend returns 204 No Content
  return apiRequest(`/chatbots/${id}`, "DELETE");
}

// ===============================================
// USER SETTINGS
// ===============================================

/**
 * Fetches the current authenticated user's settings/profile data.
 */
export async function getSettings(): Promise<any> {
  return apiRequest("/user", "GET");
}

/**
 * Updates the current authenticated user's settings/profile data.
 */
export async function updateSettings(data: any): Promise<any> {
  return apiRequest("/user", "PUT", data);
}
