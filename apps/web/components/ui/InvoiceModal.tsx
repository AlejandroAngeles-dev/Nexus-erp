'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getCustomers, createInvoice, Customer } from '@/lib/api';

interface Props {
  onClose:   () => void;
  onSuccess: () => void;
}

interface InvoiceItemForm {
  description: string;
  quantity:    number;
  unitPrice:   number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

export default function InvoiceModal({ onClose, onSuccess }: Props) {
  const { token } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const [form, setForm] = useState({
    customerId: '',
    dueDate:    '',
    tax:        16,
    notes:      '',
  });

  const [items, setItems] = useState<InvoiceItemForm[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    if (!token) return;
    getCustomers(token, 1, 100)
      .then(res => setCustomers(res.data))
      .catch(console.error);
  }, [token]);

  const addItem = () =>
    setItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);

  const removeItem = (index: number) =>
    setItems(prev => prev.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof InvoiceItemForm, value: string | number) =>
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * form.tax / 100;
  const total     = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!form.customerId) { setError('Selecciona un cliente'); return; }
    if (items.some(i => !i.description || i.unitPrice <= 0)) {
      setError('Completa todos los conceptos con descripción y precio válido');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await createInvoice(token, {
        customerId: form.customerId,
        dueDate:    form.dueDate,
        tax:        form.tax,
        notes:      form.notes || undefined,
        items:      items.map(i => ({
          description: i.description,
          quantity:    Number(i.quantity),
          unitPrice:   Number(i.unitPrice),
        })),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Error al crear la factura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">Nueva Factura</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       hover:bg-gray-100 transition text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg
                            text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Cliente y fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select
                value={form.customerId}
                onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition bg-white"
              >
                <option value="">Selecciona un cliente</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de vencimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                required
                min={new Date().toISOString().slice(0, 10)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Conceptos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Conceptos <span className="text-red-500">*</span>
              </label>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs text-blue-600
                           hover:text-blue-700 font-medium transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 4v16m8-8H4" />
                </svg>
                Agregar concepto
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Headers */}
              <div className="grid grid-cols-12 gap-2 bg-gray-50 px-3 py-2 border-b border-gray-200">
                <div className="col-span-6 text-xs font-semibold text-gray-500 uppercase">
                  Descripción
                </div>
                <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase text-center">
                  Cant.
                </div>
                <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase text-right">
                  P. Unitario
                </div>
                <div className="col-span-1" />
              </div>

              {/* Filas de items */}
              {items.map((item, i) => (
                <div key={i}
                  className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-gray-100
                             last:border-0 items-center">
                  <div className="col-span-6">
                    <input
                      value={item.description}
                      onChange={e => updateItem(i, 'description', e.target.value)}
                      placeholder="Descripción del servicio"
                      required
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500
                                 focus:border-transparent placeholder:text-gray-400 transition"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                      min="1"
                      required
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500
                                 focus:border-transparent text-center transition"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={item.unitPrice || ''}
                      onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500
                                 focus:border-transparent text-right transition"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)}
                        className="text-gray-400 hover:text-red-500 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IVA y Notas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IVA (%)
              </label>
              <select
                value={form.tax}
                onChange={e => setForm(f => ({ ...f, tax: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition bg-white"
              >
                <option value={0}>Sin IVA (0%)</option>
                <option value={8}>IVA reducido (8%)</option>
                <option value={16}>IVA estándar (16%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <input
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Información adicional..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent placeholder:text-gray-400 transition"
              />
            </div>
          </div>

          {/* Resumen de totales */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>IVA ({form.tax}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900
                            pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm
                         font-medium text-gray-600 hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                         text-white text-sm font-semibold rounded-lg transition
                         flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creando...
                </>
              ) : 'Crear Factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}