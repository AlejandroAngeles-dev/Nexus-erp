'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getDashboardMetrics, DashboardMetrics } from '@/lib/api';
import Link from 'next/link';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getDashboardMetrics(token)
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const maxActivity = Math.max(...(metrics?.activity.map(a => a.count) ?? [1]));

  const cards = metrics ? [
    {
      label:    'CLIENTES ACTIVOS',
      value:    String(metrics.totalCustomers),
      change:   '+12%',
      type:     'positive',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      iconBg: 'bg-blue-50',
    },
    {
      label:  'FACTURAS DEL MES',
      value:  String(metrics.invoicesThisMonth),
      change: '+5.2%',
      type:   'positive',
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      iconBg: 'bg-purple-50',
    },
    {
      label:  'INGRESOS DEL MES',
      value:  formatCurrency(metrics.revenueThisMonth),
      change: metrics.revenueChange >= 0 ? `+${metrics.revenueChange}%` : `${metrics.revenueChange}%`,
      type:   metrics.revenueChange >= 0 ? 'positive' : 'negative',
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      iconBg: 'bg-orange-50',
    },
    {
      label:  'PENDIENTES',
      value:  String(metrics.pendingInvoices),
      change: 'Atención',
      type:   'warning',
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      iconBg: 'bg-red-50',
    },
  ] : [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Bienvenido de nuevo, {user?.name?.split(' ')[0]}.
          </p>
        </div>
        <Link href="/invoices"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Factura
        </Link>
      </div>

      {/* Métricas */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="w-11 h-11 bg-gray-200 rounded-xl mb-3" />
              <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-7 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                  {card.icon}
                </div>
                {card.type === 'positive' && (
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {card.change}
                  </span>
                )}
                {card.type === 'warning' && (
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    {card.change}
                  </span>
                )}
                {card.type === 'negative' && (
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    {card.change}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actividad + Accesos rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Gráfica de actividad */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
          {loading ? (
            <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-end gap-3 h-40">
              {metrics?.activity.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-200 hover:bg-blue-400 rounded-t-md transition-all"
                    style={{ height: `${maxActivity > 0 ? (item.count / maxActivity) * 100 : 5}%`,
                             minHeight: '4px' }}
                  />
                  <span className="text-xs text-gray-400">{item.day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accesos rápidos + Estado */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Accesos Rápidos</h2>
            <div className="space-y-2">
              <Link href="/customers"
                className="w-full flex items-center gap-3 px-3 py-2.5 border border-gray-200
                           rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                Ver Clientes
              </Link>
              <Link href="/invoices"
                className="w-full flex items-center gap-3 px-3 py-2.5 border border-gray-200
                           rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Ver Facturas
              </Link>
            </div>
          </div>

          <div className="bg-blue-600 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-1">Estado del Servidor</h2>
            <p className="text-sm text-blue-200 mb-3">Todos los sistemas operativos.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="text-sm font-semibold text-white">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}