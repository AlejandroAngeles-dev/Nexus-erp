'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [form, setForm] = useState({
    companyName:  '',
    companyEmail: '',
    companyRfc:   '',
    adminName:    '',
    adminEmail:   '',
    password:     '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          companyName:  form.companyName,
          companyEmail: form.companyEmail,
          companyRfc:   form.companyRfc || undefined,
          adminName:    form.adminName,
          adminEmail:   form.adminEmail,
          password:     form.password,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Error al registrar');
      }

      const { token, user } = await res.json();
      login(token, user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center
                        justify-center mb-3 shadow-lg">
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6M9 8h6M9 16h4" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Nexus ERP</h1>
        <p className="text-sm text-gray-500">Crea tu cuenta empresarial</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Registrar empresa</h2>
        <p className="text-sm text-gray-500 mb-6">
          Completa los datos para comenzar a usar NexusERP.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg
                          text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Datos de la empresa */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3
                           flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center
                               text-white text-xs font-bold">1</span>
              Datos de la empresa
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la empresa <span className="text-red-500">*</span>
                </label>
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Mi Empresa SA de CV"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent placeholder:text-gray-400 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email empresarial <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="companyEmail"
                    type="email"
                    value={form.companyEmail}
                    onChange={handleChange}
                    required
                    placeholder="contacto@empresa.com"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               focus:border-transparent placeholder:text-gray-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RFC <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    name="companyRfc"
                    value={form.companyRfc}
                    onChange={handleChange}
                    placeholder="ABC123456789"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               focus:border-transparent placeholder:text-gray-400 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-gray-200" />

          {/* Datos del administrador */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3
                           flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center
                               text-white text-xs font-bold">2</span>
              Usuario administrador
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  name="adminName"
                  value={form.adminName}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre completo"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent placeholder:text-gray-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email personal <span className="text-red-500">*</span>
                </label>
                <input
                  name="adminEmail"
                  type="email"
                  value={form.adminEmail}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent placeholder:text-gray-400 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               focus:border-transparent placeholder:text-gray-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Repite tu contraseña"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               focus:border-transparent placeholder:text-gray-400 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                       text-white font-semibold py-2.5 rounded-lg transition
                       flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creando cuenta...
              </>
            ) : 'Crear cuenta empresarial'}
          </button>
        </form>

        <div className="my-6 border-t border-gray-200" />

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Iniciar sesión
          </Link>
        </p>
      </div>

      {/* Badges */}
      <div className="flex gap-3 mt-6">
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200
                         rounded-full text-xs text-gray-600 shadow-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Sistemas Operativos
        </span>
        <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-full
                         text-xs text-gray-600 shadow-sm">
          v4.2.0 Stable
        </span>
      </div>
    </main>
  );
}