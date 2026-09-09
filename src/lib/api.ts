const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'nexcampus_access_token';
const REFRESH_TOKEN_KEY = 'nexcampus_refresh_token';

export type AuthProfile = {
  id: string;
  full_name: string;
  student_id?: string | null;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  program?: string | null;
  year?: number | null;
  section?: string | null;
  residence_type?: string | null;
  residence?: string | null;
  room?: string | null;
  bus_number?: string | null;
  mentor?: string | null;
  role: 'student' | 'staff' | 'admin';
  is_active: boolean;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: { id: string; email: string };
  profile: AuthProfile;
};

export type SignupPayload = {
  email: string;
  password: string;
  full_name: string;
  student_id?: string;
  department?: string;
  program?: string;
  year?: number;
  section?: string;
  residence_type?: string;
  residence?: string;
  room?: string;
  bus_number?: string;
};

function getToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function hasSession() {
  return Boolean(getToken());
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function saveSession(accessToken: string, refreshToken?: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) clearSession();
    const detail = typeof body === 'object' && body?.detail ? body.detail : 'Request failed. Please try again.';
    throw new Error(detail);
  }
  return body as T;
}

export async function login(email: string, password: string) {
  const result = await request<LoginResponse>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  saveSession(result.access_token, result.refresh_token);
  return result;
}

export async function signup(payload: SignupPayload) {
  const result = await request<{ access_token: string | null; refresh_token: string | null; requires_email_confirmation: boolean; user: { id: string; email: string } }>('/auth/signup', {
    method: 'POST', body: JSON.stringify(payload),
  });
  if (result.access_token) saveSession(result.access_token, result.refresh_token || undefined);
  return result;
}

export async function getCurrentUser() {
  return request<{ user: { id: string; email: string }; profile: AuthProfile }>('/auth/me');
}

export async function logout() {
  clearSession();
}

export async function getCategories() {
  return request<Array<{ id: string; key: string; name: string; icon?: string; subtitle?: string; question?: string; private_reporting: boolean }>>('/api/categories');
}

export async function getSubcategories(categoryId: string) {
  return request<Array<{ id: string; category_id: string; name: string }>>(`/api/categories/${categoryId}/subcategories`);
}

export async function getMyComplaints() {
  return request<any[]>('/api/complaints/me');
}

export async function createComplaint(payload: Record<string, unknown>) {
  return request<any>('/api/complaints', { method: 'POST', body: JSON.stringify(payload) });
}

export async function analyzeComplaint(id: string) {
  return request<any>(`/api/complaints/${id}/analyze`, { method: 'POST' });
}

export async function updateComplaintStatus(id: string, status: string, note?: string) {
  return request<any>(`/api/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) });
}
