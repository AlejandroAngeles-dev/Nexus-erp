'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getCustomers, deleteCustomer, Customer } from '@/lib/api';
import CustomerModal from '@/components/ui/CustomerModal';

export default function CustomersPage() {
  const { token } = useAuth();

  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getCustomers(token, page, 10, search || undefined);
      setCustomers(res.data);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('¿Desactivar este cliente?')) return;
    await deleteCustomer(token, id);
    fetchCustomers();
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} clientes registrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre, email o RFC..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-transparent placeholder:text-gray-400 transition"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm
                     font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Buscar
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm
                       font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Limpiar
          </button>
        )}
      </form>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Nombre</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Teléfono</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">RFC</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Fecha</th>
              <th className="text-right px-5 py-3 font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  <svg className="animate-spin w-6 h-6 mx-auto mb-2 text-blue-500"
                    fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Cargando clientes...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No se encontraron clientes
                </td>
              </tr>
            ) : (
              customers.map((customer, i) => (
                <tr
                  key={customer.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition
                              ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center
                                      justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {customer.email ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {customer.phone ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {customer.rfc ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {new Date(customer.createdAt).toLocaleDateString('es-MX', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingCustomer(customer)}
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition text-gray-400
                                   hover:text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition text-gray-400
                                   hover:text-red-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg
                           disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg
                           disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de editat y agregar nuevo cliente */}
      {(showModal || editingCustomer) && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => { setShowModal(false); setEditingCustomer(null); }}
          onSuccess={() => fetchCustomers()}
        />
      )}

    </div>
  );

 
}