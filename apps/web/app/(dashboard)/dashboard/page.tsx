'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const metrics = [
  {
    label: 'CLIENTES ACTIVOS',
    value: '452',
    change: '+12%',
    changeType: 'positive',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    iconBg: 'bg-blue-50',
  },
  {
    label: 'FACTURAS DEL MES',
    value: '128',
    change: '+5.2%',
    changeType: 'positive',
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    iconBg: 'bg-purple-50',
  },
  {
    label: 'INGRESOS',
    value: '45.200 €',
    change: '+8.4%',
    changeType: 'positive',
    icon: (
      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    iconBg: 'bg-orange-50',
  },
  {
    label: 'PENDIENTES',
    value: '12',
    change: 'Atención',
    changeType: 'warning',
    icon: (
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    iconBg: 'bg-red-50',
  },
];

const activityData = [40, 65, 35, 80, 55, 90, 70];
const activityLabels = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
const maxValue = Math.max(...activityData);

const quickActions = [
  {
    label: 'Nueva Tarea',
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 4v16m8-8H4" />
      </svg>
    ),
    iconBg: 'bg-blue-50',
  },
  {
    label: 'Subir XML',
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    iconBg: 'bg-blue-50',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

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
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Factura
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 ${metric.iconBg} rounded-xl flex items-center justify-center`}>
                {metric.icon}
              </div>
              {metric.changeType === 'positive' && (
                <span className="text-xs font-semibold text-green-600 bg-green-50
                                 px-2 py-0.5 rounded-full">
                  {metric.change}
                </span>
              )}
              {metric.changeType === 'warning' && (
                <span className="text-xs font-semibold text-red-600 bg-red-50
                                 px-2 py-0.5 rounded-full">
                  {metric.change}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 tracking-wide">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actividad + Accesos rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Gráfica de actividad */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="flex items-end gap-3 h-40">
            {activityData.map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-200 rounded-t-md transition-all hover:bg-blue-400"
                  style={{ height: `${(value / maxValue) * 100}%` }}
                />
                <span className="text-xs text-gray-400">{activityLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accesos rápidos + Estado del servidor */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Accesos Rápidos</h2>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 border border-gray-200
                             rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
                >
                  <div className={`w-8 h-8 ${action.iconBg} rounded-lg flex items-center justify-center`}>
                    {action.icon}
                  </div>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Estado del servidor */}
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