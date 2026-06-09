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

// ── Invoices ─────────────────────────────────────────────────────────────────

export async function getInvoices(
  token: string,
  page = 1,
  limit = 10,
  status?: string,
  search?: string,
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(status && { status }),
    ...(search && { search }),
  });
  return fetchAPI<PaginatedResponse<Invoice>>(`/invoices?${params}`, {}, token);
}

export async function createInvoice(token: string, data: CreateInvoiceData) {
  return fetchAPI<Invoice>('/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
}

export async function updateInvoiceStatus(token: string, id: string, status: string) {
  return fetchAPI<Invoice>(`/invoices/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, token);
}

// ── Tipos de facturas ────────────────────────────────────────────────────────

export interface InvoiceItem {
  id:          string;
  description: string;
  quantity:    number;
  unitPrice:   number;
  total:       number;
}

export interface Invoice {
  id:         string;
  number:     string;
  status:     'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal:   number;
  tax:        number;
  total:      number;
  notes:      string | null;
  dueDate:    string;
  customerId: string;
  customer:   { id: string; name: string };
  items:      InvoiceItem[];
  createdAt:  string;
}

export interface CreateInvoiceData {
  customerId: string;
  dueDate:    string;
  tax:        number;
  notes?:     string;
  items:      { description: string; quantity: number; unitPrice: number }[];
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(token: string) {
  return fetchAPI<UserDetail[]>('/users', {}, token);
}

export async function createUser(token: string, data: CreateUserData) {
  return fetchAPI<UserDetail>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
}

export async function deactivateUser(token: string, id: string) {
  return fetchAPI<{ id: string; active: boolean }>(`/users/${id}`, {
    method: 'DELETE',
  }, token);
}

export interface UserDetail {
  id:        string;
  name:      string;
  email:     string;
  role:      'ADMIN' | 'EMPLOYEE' | 'VIEWER';
  active:    boolean;
  createdAt: string;
}

export interface CreateUserData {
  name:     string;
  email:    string;
  password: string;
  role:     'ADMIN' | 'EMPLOYEE' | 'VIEWER';
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardMetrics(token: string) {
  return fetchAPI<DashboardMetrics>('/dashboard/metrics', {}, token);
}

export interface DashboardMetrics {
  totalCustomers:    number;
  invoicesThisMonth: number;
  revenueThisMonth:  number;
  revenueChange:     number;
  pendingInvoices:   number;
  activity:          { day: string; count: number }[];
}