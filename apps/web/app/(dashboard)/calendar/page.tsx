'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getPaymentCalendar, updateInvoiceStatus, PaymentCalendar } from '@/lib/api';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CalendarPage() {
  const { token } = useAuth();
  const [data, setData]         = useState<PaymentCalendar | null>(null);
  const [loading, setLoading]   = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const fetchCalendar = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getPaymentCalendar(token);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalendar(); }, [token]);

  const handleMarkPaid = async (id: string) => {
    if (!token) return;
    await updateInvoiceStatus(token, id, 'PAID');
    fetchCalendar();
    setSelectedDay(null);
  };

  // Construir el grid del mes
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date().toISOString().slice(0, 10);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDayKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const selectedInvoices = selectedDay ? (data?.grouped[selectedDay] ?? []) : [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Pagos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Visualiza y gestiona los vencimientos de tus facturas
          </p>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total por cobrar</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '—' : formatCurrency(data?.totalPending ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Facturas pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">
            {loading ? '—' : data?.count ?? 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Calendario */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">

          {/* Navegación del mes */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                         hover:bg-gray-100 transition text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-base font-semibold text-gray-900">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                         hover:bg-gray-100 transition text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7 gap-1">
            {/* Espacios vacíos al inicio */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Días del mes */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day    = i + 1;
              const dayKey = getDayKey(day);
              const isToday     = dayKey === today;
              const isSelected  = dayKey === selectedDay;
             const hasInvoices = (data?.grouped[dayKey]?.length ?? 0) > 0;
              const invoiceCount = data?.grouped[dayKey]?.length ?? 0;
              const isOverdue   = hasInvoices && new Date(dayKey) < new Date(today);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : dayKey)}
                  className={`relative aspect-square flex flex-col items-center justify-center
                              rounded-lg text-sm transition
                              ${isSelected   ? 'bg-blue-600 text-white' :
                                isToday      ? 'bg-blue-50 text-blue-600 font-bold' :
                                hasInvoices  ? 'hover:bg-gray-50 cursor-pointer' :
                                               'hover:bg-gray-50 text-gray-700'}`}
                >
                  <span className="font-medium">{day}</span>
                  {hasInvoices && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full
                                     ${isSelected  ? 'bg-white' :
                                       isOverdue   ? 'bg-red-500' :
                                                     'bg-yellow-400'}`} />
                  )}
                  {invoiceCount > 1 && (
                    <span className={`absolute top-0.5 right-0.5 text-xs font-bold
                                     ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                      {invoiceCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="text-xs text-gray-500">Pendiente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-xs text-gray-500">Vencida</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-xs text-gray-500">Hoy</span>
            </div>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="space-y-4">

          {/* Detalle del día seleccionado */}
          {selectedDay ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">
                {new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-MX', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </h3>
              {selectedInvoices.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Sin vencimientos este día
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedInvoices.map(inv => {
                    const overdue = new Date(inv.dueDate) < new Date();
                    return (
                      <div key={inv.id}
                        className={`border-l-4 pl-3 py-2
                                   ${overdue ? 'border-red-400' : 'border-yellow-400'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-blue-600 font-mono">
                              {inv.number}
                            </p>
                            <p className="text-xs text-gray-600">{inv.customer.name}</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">
                              {formatCurrency(inv.total)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleMarkPaid(inv.id)}
                            title="Marcar como pagada"
                            className="flex-shrink-0 p-1.5 bg-green-50 hover:bg-green-100
                                       rounded-lg transition text-green-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-400 text-center py-4">
                Selecciona un día para ver los vencimientos
              </p>
            </div>
          )}

          {/* Lista de próximos vencimientos */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Próximos vencimientos</h3>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : data?.invoices.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No hay vencimientos próximos
              </p>
            ) : (
              <div className="space-y-2">
                {data?.invoices.slice(0, 5).map(inv => {
                  const overdue = new Date(inv.dueDate) < new Date();
                  const days    = Math.abs(Math.round(
                    (new Date().getTime() - new Date(inv.dueDate).getTime())
                    / (1000 * 60 * 60 * 24)
                  ));
                  return (
                    <div key={inv.id}
                      className={`flex items-center justify-between p-2.5
                                  border-l-4 rounded-r-lg bg-gray-50
                                  ${overdue ? 'border-red-400' : 'border-yellow-400'}`}>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          {inv.customer.name}
                        </p>
                        <p className={`text-xs mt-0.5
                                      ${overdue ? 'text-red-500' : 'text-yellow-600'}`}>
                          {overdue
                            ? `Vencida hace ${days} día${days !== 1 ? 's' : ''}`
                            : `Vence en ${days} día${days !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(inv.total)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}