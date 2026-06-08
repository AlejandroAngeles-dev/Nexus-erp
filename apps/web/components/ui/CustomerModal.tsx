'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createCustomer, CreateCustomerData, Customer } from '@/lib/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer | null; // Si viene un cliente, estamos editando
}

export default function CustomerModal({ onClose, onSuccess, customer }: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const isEditing = !!customer;

  const [form, setForm] = useState<CreateCustomerData>({
    name: '', email: '', phone: '', rfc: '', address: '', notes: '',
  });

  // Si viene un cliente, precargamos sus datos en el formulario
  useEffect(() => {
    if (customer) {
      setForm({
        name:    customer.name    ?? '',
        email:   customer.email   ?? '',
        phone:   customer.phone   ?? '',
        rfc:     customer.rfc     ?? '',
        address: customer.address ?? '',
        notes:   customer.notes   ?? '',
      });
    }
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== '')
      ) as CreateCustomerData;

      if (isEditing && customer) {
        // Editar 
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/customers/${customer.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );
      } else {
        // Crear
        await createCustomer(token, data);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Nombre o razón social"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent placeholder:text-gray-400 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@empresa.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent placeholder:text-gray-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="55 1234 5678"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent placeholder:text-gray-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
              <input
                name="rfc"
                value={form.rfc}
                onChange={handleChange}
                placeholder="ABC123456789"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent placeholder:text-gray-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Calle, ciudad"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent placeholder:text-gray-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Información adicional..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent placeholder:text-gray-400 transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm
                         font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                         text-white text-sm font-semibold rounded-lg transition
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Guardando...
                </>
              ) : isEditing ? 'Guardar Cambios' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}