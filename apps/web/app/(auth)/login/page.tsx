'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { login as loginAPI } from '@/lib/api';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export default function LoginPage() {
  const router = useRouter();
  const { login, token, isLoading } = useAuth();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [remember, setRemember]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Si ya hay sesión activa, redirigir al dashboard
  useEffect(() => {
    if (!isLoading && token) {
      router.push('/dashboard');
    }
  }, [token, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { token, user } = await loginAPI(email, password);
      login(token, user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      {/* Logo y título */}
      <div className="flex flex-col items-center mb-8">
      {/*   <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6M9 8h6M9 16h4" />
          </svg>
        </div> */}
        <h1 className="text-xl font-bold text-gray-900">Nexus ERP</h1>
        <p className="text-sm text-gray-500">Administración Central</p>
      </div>

      {/* Card de login */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido de nuevo</h2>
        <p className="text-sm text-gray-500 mb-6">
          Introduce tus credenciales para acceder al sistema.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@nexus.com"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder:text-gray-400 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <a href="#" className="text-xs text-blue-600 hover:underline">
                ¿Has olvidado tu contraseña?
              </a>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder:text-gray-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Recordar sesión */}
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="remember" className="text-sm text-gray-600">
              Recordar sesión
            </label>
          </div>

          {/* Botón submit */}
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Iniciando sesión...
              </>
            ) : (
              <>
                Iniciar Sesión
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="my-6 border-t border-gray-200" />

        <p className="text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <a href="/register" className="text-blue-600 hover:underline font-medium">
            Contacta con administración
          </a>
        </p>
      </div>

      {/* Badges de estado */}
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

     {/* Badge de métricas (decorativo) */}
      <div className="absolute top-20 right-40 bg-white border border-gray-200 rounded-xl
                      shadow-sm px-4 py-3 hidden lg:flex items-center gap-3
                      rotate-15 animate-bounce">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-gray-400">Métricas en tiempo real</p>
          <p className="text-sm font-bold text-gray-800">+12.5%</p>
        </div>
      </div>

    </main>
  );
}


