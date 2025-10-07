const API_BASE_URL = 'http://localhost:3001/api';

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// Make authenticated request
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

// Authentication
export async function signup(email: string, password: string, name: string) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name })
  });
}

export async function login(email: string, password: string) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  // Save token
  if (response.token) {
    localStorage.setItem('auth_token', response.token);
  }
  
  return response;
}

export async function logout() {
  localStorage.removeItem('auth_token');
}

export async function getSession() {
  const token = getAuthToken();
  if (!token) return null;
  
  // Decode JWT to get user info (in production, verify with backend)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { user: payload };
  } catch {
    return null;
  }
}

// Chatbots
export async function getChatbots() {
  return apiRequest('/chatbots');
}

export async function getChatbot(id: string) {
  return apiRequest(`/chatbots/${id}`);
}

export async function createChatbot(data: any) {
  return apiRequest('/chatbots', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateChatbot(id: string, data: any) {
  return apiRequest(`/chatbots/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteChatbot(id: string) {
  return apiRequest(`/chatbots/${id}`, {
    method: 'DELETE'
  });
}

export function getSettings() {
  console.log("Get Settings") 
}

export function updateSettings(){
  console.log("Update Settings")
}