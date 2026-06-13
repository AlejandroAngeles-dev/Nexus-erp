'use client';

import { Invoice } from '@/lib/api';

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  PENDING:   { label: 'Pendiente',  classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  PAID:      { label: 'Pagada',     classes: 'bg-green-100  text-green-700  border-green-200'  },
  OVERDUE:   { label: 'Vencida',    classes: 'bg-red-100    text-red-700    border-red-200'    },
  CANCELLED: { label: 'Cancelada',  classes: 'bg-gray-100   text-gray-600   border-gray-200'   },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

export default function InvoiceDetailModal({ invoice, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-mono">
              {invoice.number}
            </h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border
                             ${STATUS_LABELS[invoice.status].classes}`}>
              {STATUS_LABELS[invoice.status].label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       hover:bg-gray-100 transition text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Info cliente y fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Cliente
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center
                                justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">
                    {invoice.customer.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {invoice.customer.name}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Fecha de emisión
              </p>
              <p className="text-sm text-gray-800">{formatDate(invoice.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Fecha de vencimiento
              </p>
              <p className={`text-sm font-medium
                ${invoice.status === 'OVERDUE' ? 'text-red-600' : 'text-gray-800'}`}>
                {formatDate(invoice.dueDate)}
              </p>
            </div>
            {invoice.notes && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  Notas
                </p>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Conceptos
            </p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-500 text-xs">
                      Descripción
                    </th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-500 text-xs">
                      Cant.
                    </th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-500 text-xs">
                      P. Unitario
                    </th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-500 text-xs">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr key={item.id}
                      className={`border-b border-gray-100 last:border-0
                                  ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-2.5 text-gray-700">{item.description}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>IVA ({invoice.tax}%)</span>
              <span>{formatCurrency(invoice.total - invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900
                            pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                       font-medium text-gray-600 hover:bg-gray-50 transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}