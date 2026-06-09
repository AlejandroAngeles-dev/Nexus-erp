'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getInvoices, updateInvoiceStatus, Invoice } from '@/lib/api';

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  PENDING:   { label: 'Pendiente',  classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  PAID:      { label: 'Pagada',     classes: 'bg-green-100  text-green-700  border-green-200'  },
  OVERDUE:   { label: 'Vencida',    classes: 'bg-red-100    text-red-700    border-red-200'    },
  CANCELLED: { label: 'Cancelada',  classes: 'bg-gray-100   text-gray-600   border-gray-200'   },
};

const STATUS_FILTERS = [
  { value: '',          label: 'Todas'      },
  { value: 'PAID',      label: 'Pagadas'    },
  { value: 'PENDING',   label: 'Pendientes' },
  { value: 'OVERDUE',   label: 'Vencidas'   },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

const isOverdue = (dueDate: string, status: string) =>
  status === 'PENDING' && new Date(dueDate) < new Date();

export default function InvoicesPage() {
  const { token } = useAuth();

  const [invoices, setInvoices]       = useState<Invoice[]>([]);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [page, setPage]               = useState(1);
  const [status, setStatus]           = useState('');
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading]         = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getInvoices(token, page, 10, status || undefined, search || undefined);
      setInvoices(res.data);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, page, status, search]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!token) return;
    await updateInvoiceStatus(token, id, newStatus);
    fetchInvoices();
  };

  // Métricas calculadas desde los datos cargados
  const totalAmount  = invoices.reduce((s, i) => s + i.total, 0);
  const paidAmount   = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0);
  const pendingAmount= invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.total, 0);
  const overdueAmount= invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.total, 0);

  // Vencimientos próximos — facturas PENDING u OVERDUE ordenadas por dueDate
  const upcoming = [...invoices]
    .filter(i => i.status === 'PENDING' || i.status === 'OVERDUE')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Facturas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Supervisa y administra el flujo de ingresos de tu empresa.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200
                             bg-white text-gray-700 text-sm font-medium rounded-lg
                             hover:bg-gray-50 transition shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar Todo
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                             text-white text-sm font-semibold px-4 py-2.5 rounded-lg
                             transition shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4v16m8-8H4" />
            </svg>
            Nueva Factura
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Facturado</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +12% este mes
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Pagadas</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(paidAmount)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {total > 0
              ? `${Math.round((invoices.filter(i => i.status === 'PAID').length / invoices.length) * 100)}% del total`
              : '0% del total'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {invoices.filter(i => i.status === 'PENDING').length} facturas activas
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Vencidas</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</p>
          {overdueAmount > 0 && (
            <p className="text-xs text-red-500 font-medium mt-1">Requiere acción inmediata</p>
          )}
        </div>
      </div>

      {/* Filtros y buscador */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-2">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setStatus(f.value); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition
                ${status === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
          <div className="relative">
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
              placeholder="Buscar por cliente..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent placeholder:text-gray-400 transition w-52"
            />
          </div>
          <button type="submit"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm
                       font-medium text-gray-600 hover:bg-gray-50 transition">
            Buscar
          </button>
          {search && (
            <button type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm
                         font-medium text-gray-600 hover:bg-gray-50 transition">
              Limpiar
            </button>
          )}
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                N.º Factura
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                Cliente
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                Fecha
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                Vencimiento
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                Total
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                Estado
              </th>
              <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  <svg className="animate-spin w-6 h-6 mx-auto mb-2 text-blue-500"
                    fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Cargando facturas...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  No se encontraron facturas
                </td>
              </tr>
            ) : (
              invoices.map((invoice, i) => (
                <tr key={invoice.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition
                              ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>

                  {/* Número */}
                  <td className="px-5 py-4">
                    <span className="font-mono font-semibold text-blue-600 text-sm">
                      {invoice.number}
                    </span>
                  </td>

                  {/* Cliente */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center
                                      justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">
                          {invoice.customer.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{invoice.customer.name}</span>
                    </div>
                  </td>

                  {/* Fecha creación */}
                  <td className="px-5 py-4 text-gray-500 text-sm">
                    {formatDate(invoice.createdAt)}
                  </td>

                  {/* Vencimiento */}
                  <td className={`px-5 py-4 text-sm font-medium
                    ${isOverdue(invoice.dueDate, invoice.status)
                      ? 'text-red-600'
                      : 'text-gray-500'}`}>
                    {formatDate(invoice.dueDate)}
                  </td>

                  {/* Total */}
                  <td className="px-5 py-4 font-semibold text-gray-900">
                    {formatCurrency(invoice.total)}
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border
                                     ${STATUS_LABELS[invoice.status].classes}`}>
                      {STATUS_LABELS[invoice.status].label}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {/* Ver detalle */}
                      <button title="Ver detalle"
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition
                                   text-gray-400 hover:text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {/* Descargar */}
                      <button title="Descargar PDF"
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition
                                   text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>

                      {/* Marcar pagada */}
                      {invoice.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(invoice.id, 'PAID')}
                          title="Marcar como pagada"
                          className="p-1.5 hover:bg-green-50 rounded-lg transition
                                     text-gray-400 hover:text-green-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}

                      {/* Cancelar */}
                      {(invoice.status === 'PENDING' || invoice.status === 'OVERDUE') && (
                        <button
                          onClick={() => handleStatusChange(invoice.id, 'CANCELLED')}
                          title="Cancelar factura"
                          className="p-1.5 hover:bg-red-50 rounded-lg transition
                                     text-gray-400 hover:text-red-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer tabla */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Mostrando {invoices.length} de {total} facturas
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-200
                           rounded-lg disabled:opacity-40 hover:bg-gray-50 transition text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center border rounded-lg
                               text-sm font-medium transition
                              ${page === p
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-gray-200
                           rounded-lg disabled:opacity-40 hover:bg-gray-50 transition text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sección inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Vencimientos próximos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Vencimientos Próximos</h2>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No hay vencimientos próximos
              </p>
            ) : (
              upcoming.map(invoice => {
                const overdue = new Date(invoice.dueDate) < new Date();
                const daysAgo = Math.abs(Math.round(
                  (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                ));
                return (
                  <div key={invoice.id}
                    className="flex items-center justify-between py-2.5 border-l-4 pl-3
                               border-gray-200"
                    style={{ borderLeftColor: overdue ? '#ef4444' : '#f59e0b' }}>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{invoice.customer.name}</p>
                      <p className={`text-xs mt-0.5 ${overdue ? 'text-red-500' : 'text-yellow-600'}`}>
                        {overdue
                          ? `Vencido hace ${daysAgo} día${daysAgo !== 1 ? 's' : ''}`
                          : `Vence en ${daysAgo} día${daysAgo !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <button className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-sm
                             font-medium text-gray-600 hover:bg-gray-50 transition">
            Ver Calendario de Pagos
          </button>
        </div>

        {/* Consolidación bancaria */}
        <div className="bg-blue-600 rounded-xl p-5 text-white">
          <h2 className="font-semibold text-lg mb-1">Consolidación Bancaria</h2>
          <p className="text-blue-200 text-sm mb-4">
            Has conciliado {invoices.filter(i => i.status === 'PAID').length} facturas
            con tus extractos bancarios esta semana. Buen trabajo.
          </p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-2">
              {['A', 'B', 'C'].map((l, i) => (
                <div key={i}
                  className="w-8 h-8 rounded-full bg-blue-400 border-2 border-blue-600
                             flex items-center justify-center text-xs font-bold">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-sm text-blue-200">Tu equipo de finanzas está activo</p>
          </div>
          <button className="w-full py-2.5 bg-white text-blue-600 font-semibold text-sm
                             rounded-lg hover:bg-blue-50 transition">
            Acceder al Informe Semanal
          </button>
        </div>
      </div>
    </div>
  );
}