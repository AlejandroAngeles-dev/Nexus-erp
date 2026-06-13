'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getWeeklyReport, WeeklyReport } from '@/lib/api';
import Link from 'next/link';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  PENDING:   { label: 'Pendiente',  classes: 'bg-yellow-100 text-yellow-700' },
  PAID:      { label: 'Pagada',     classes: 'bg-green-100  text-green-700'  },
  OVERDUE:   { label: 'Vencida',    classes: 'bg-red-100    text-red-700'    },
  CANCELLED: { label: 'Cancelada',  classes: 'bg-gray-100   text-gray-600'   },
};

export default function WeeklyReportPage() {
  const { token } = useAuth();
  const [data, setData]       = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getWeeklyReport(token)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const ChangeIndicator = ({ change }: { change: number }) => (
    <span className={`text-xs font-semibold flex items-center gap-1
                     ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d={change >= 0
            ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
      </svg>
      {change >= 0 ? '+' : ''}{change}% vs semana anterior
    </span>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/invoices"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 19l-7-7 7-7" />
              </svg>
              Facturas
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-500">Informe Semanal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Informe Semanal</h1>
          {data && (
            <p className="text-sm text-gray-500 mt-0.5">
              {formatDate(data.period.start)} — {formatDate(data.period.end)}
            </p>
          )}
        </div>

        {/* Botón exportar */}
        <button
          onClick={() => {
            if (!data) return;
            const rows = [
              ['Informe Semanal NexusERP'],
              [`Período: ${formatDate(data.period.start)} - ${formatDate(data.period.end)}`],
              [],
              ['RESUMEN'],
              ['Facturas emitidas', data.invoices.count, formatCurrency(data.invoices.total)],
              ['Facturas cobradas', data.paid.count, formatCurrency(data.paid.total)],
              ['Nuevos clientes', data.newCustomers],
              [],
              ['DETALLE DE FACTURAS'],
              ['Número', 'Cliente', 'Estado', 'Total', 'Fecha'],
              ...data.invoices.thisWeek.map(inv => [
                inv.number,
                inv.customer.name,
                STATUS_LABELS[inv.status].label,
                inv.total.toFixed(2),
                formatDate(inv.createdAt),
              ]),
            ];
            const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href     = url;
            link.download = `informe-semanal-${data.period.start.slice(0, 10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200
                     bg-white text-gray-700 text-sm font-medium rounded-lg
                     hover:bg-gray-50 transition shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* Métricas */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-28" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Facturas emitidas
            </p>
            <p className="text-2xl font-bold text-gray-900">{data?.invoices.count}</p>
            <p className="text-sm font-semibold text-gray-600 mt-0.5">
              {formatCurrency(data?.invoices.total ?? 0)}
            </p>
            <div className="mt-2">
              <ChangeIndicator change={data?.invoices.change ?? 0} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Facturas cobradas
            </p>
            <p className="text-2xl font-bold text-green-600">{data?.paid.count}</p>
            <p className="text-sm font-semibold text-gray-600 mt-0.5">
              {formatCurrency(data?.paid.total ?? 0)}
            </p>
            <div className="mt-2">
              <ChangeIndicator change={data?.paid.change ?? 0} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Tasa de cobro
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {data && data.invoices.count > 0
                ? Math.round((data.paid.count / data.invoices.count) * 100)
                : 0}%
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {data?.paid.count} de {data?.invoices.count} facturas
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Nuevos clientes
            </p>
            <p className="text-2xl font-bold text-purple-600">{data?.newCustomers}</p>
            <p className="text-xs text-gray-400 mt-1">Esta semana</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Tabla de facturas de la semana */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Facturas de esta semana</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">
                  Número
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">
                  Cliente
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">
                  Estado
                </th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <svg className="animate-spin w-6 h-6 mx-auto text-blue-500"
                      fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  </td>
                </tr>
              ) : data?.invoices.thisWeek.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                    No hay facturas esta semana
                  </td>
                </tr>
              ) : (
                data?.invoices.thisWeek.map((inv, i) => (
                  <tr key={inv.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition
                                ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-3.5 font-mono font-semibold text-blue-600">
                      {inv.number}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{inv.customer.name}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                       ${STATUS_LABELS[inv.status].classes}`}>
                        {STATUS_LABELS[inv.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-900">
                      {formatCurrency(inv.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Top clientes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Top clientes esta semana</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : data?.topCustomers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Sin actividad esta semana
            </p>
          ) : (
            <div className="space-y-3">
              {data?.topCustomers.map((customer, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center
                                  justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {customer.invoiceCount} factura{customer.invoiceCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                    {formatCurrency(customer.totalAmount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Resumen de la semana */}
          {!loading && data && (
            <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-600 rounded-xl p-4 -mx-1">
              <p className="text-sm font-semibold text-white mb-1">Resumen de la semana</p>
              <p className="text-xs text-blue-200 mb-3">
                Has procesado {data.invoices.count} facturas
                por {formatCurrency(data.invoices.total)} en total.
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs text-white font-medium">
                  {data.paid.count} facturas cobradas
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}