const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// Función base para todas las peticiones HTTP
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si la respuesta no es exitosa, lanzamos el error con el mensaje del backend
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message ?? `Error ${response.status}`);
  }

  return response.json();
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  return fetchAPI<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ── Customers ───────────────────────────────────────────────────────────────

export async function getCustomers(
  token: string,
  page = 1,
  limit = 10,
  search?: string,
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search && { search }),
  });
  return fetchAPI<PaginatedResponse<Customer>>(
    `/customers?${params}`,
    {},
    token,
  );
}

export async function createCustomer(token: string, data: CreateCustomerData) {
  return fetchAPI<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
}

export async function deleteCustomer(token: string, id: string) {
  return fetchAPI<Customer>(`/customers/${id}`, {
    method: 'DELETE',
  }, token);
}

// ── Tipos ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  rfc: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  rfc?: string;
  address?: string;
  notes?: string;
}