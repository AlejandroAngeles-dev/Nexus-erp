'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const ROLE_LABELS: Record<string, string> = {
  ADMIN:    'Administrador',
  EMPLOYEE: 'Empleado',
  VIEWER:   'Visualizador',
};

type Section = 'personal' | 'security' | 'preferences';

export default function ProfilePage() {
  const { user, token, login } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('personal');

  // Estado nombre
  const [name, setName]               = useState(user?.name ?? '');
  const [savingName, setSavingName]   = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError]     = useState('');

  // Estado contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPass, setSavingPass]           = useState(false);
  const [passSuccess, setPassSuccess]         = useState(false);
  const [passError, setPassError]             = useState('');

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingName(true);
    setNameError('');
    setNameSuccess(false);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Error al actualizar el nombre');
      const updated = await res.json();
      if (user) login(token, { ...user, name: updated.name });
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err: any) {
      setNameError(err.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (newPassword !== confirmPassword) { setPassError('Las contraseñas no coinciden'); return; }
    if (newPassword.length < 8) { setPassError('Mínimo 8 caracteres'); return; }
    setSavingPass(true);
    setPassError('');
    setPassSuccess(false);
    try {
      const res = await fetch(`${API_URL}/users/me/password`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message ?? 'Error al cambiar la contraseña');
      }
      setPassSuccess(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err: any) {
      setPassError(err.message);
    } finally {
      setSavingPass(false);
    }
  };

  const navItems: { key: Section; label: string; icon: React.ReactNode }[] = [
    {
      key: 'personal', label: 'Información Personal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      key: 'security', label: 'Seguridad',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      key: 'preferences', label: 'Preferencias',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
  ];

  const activityItems = [
    { label: 'Sesión iniciada',           time: 'Hoy, 08:45 AM',    active: true  },
    { label: 'Cambio de contraseña',      time: 'Ayer, 04:20 PM',   active: false },
    { label: 'Actualización de perfil',   time: 'Hace 3 días',      active: false },
  ];

  return (
    <div className="space-y-2">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración de Perfil</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Gestiona tu identidad, seguridad y preferencias del sistema.
        </p>
      </div>

      <div className="flex gap-6 items-start">

        {/* Columna izquierda */}
        <div className="w-64 flex-shrink-0 space-y-4">

          {/* Tarjeta de perfil */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center
                              justify-center mx-auto">
                <span className="text-3xl font-bold text-blue-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full
                                 flex items-center justify-center shadow-md hover:bg-blue-700 transition">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <p className="font-bold text-gray-900">{user?.name}</p>
            <p className="text-xs text-blue-600 font-medium mt-0.5">
              ID: NEX-{user?.id?.slice(-4).toUpperCase()}
            </p>
            <div className="flex items-center justify-center gap-4 mt-3 pt-3
                            border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-400">Estado</p>
                <span className="text-xs font-semibold text-green-600 bg-green-50
                                 px-2 py-0.5 rounded-full">Activo</span>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Rol</p>
                <p className="text-xs font-semibold text-gray-700">
                  {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navegación de secciones */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium
                            transition border-l-2 text-left
                            ${activeSection === item.key
                              ? 'border-blue-600 text-blue-600 bg-blue-50'
                              : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
              >
                <span className={activeSection === item.key ? 'text-blue-600' : 'text-gray-400'}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Actividad reciente */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Actividad Reciente
            </p>
            <div className="space-y-3">
              {activityItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                                   ${item.active ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-xs font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha — contenido dinámico */}
        <div className="flex-1">

          {/* Información Personal */}
          {activeSection === 'personal' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                Información Personal
              </h2>
              <form onSubmit={handleUpdateName} className="space-y-4">

                {nameError && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg
                                  text-sm text-red-600">{nameError}</div>
                )}
                {nameSuccess && (
                  <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg
                                  text-sm text-green-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 13l4 4L19 7" />
                    </svg>
                    Nombre actualizado correctamente
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500
                                 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      value={user?.email ?? ''}
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                                 bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      placeholder="+52 55 1234 5678"
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                                 bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Puesto
                    </label>
                    <input
                      value={ROLE_LABELS[user?.role ?? ''] ?? ''}
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                                 bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio / Descripción Corta
                  </label>
                  <textarea
                    rows={3}
                    disabled
                    placeholder="Próximamente..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                               bg-gray-50 text-gray-400 cursor-not-allowed resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button"
                    onClick={() => setName(user?.name ?? '')}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                               font-medium text-gray-600 hover:bg-gray-50 transition">
                    Cancelar
                  </button>
                  <button type="submit" disabled={savingName}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                               disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition">
                    {savingName ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Seguridad */}
          {activeSection === 'security' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Seguridad</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">

                {passError && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg
                                  text-sm text-red-600">{passError}</div>
                )}
                {passSuccess && (
                  <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg
                                  text-sm text-green-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 13l4 4L19 7" />
                    </svg>
                    Contraseña actualizada correctamente
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               focus:border-transparent placeholder:text-gray-400 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required placeholder="Mínimo 8 caracteres"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500
                                 focus:border-transparent placeholder:text-gray-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar contraseña
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required placeholder="Repite la nueva contraseña"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500
                                 focus:border-transparent placeholder:text-gray-400 transition"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button"
                    onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                               font-medium text-gray-600 hover:bg-gray-50 transition">
                    Cancelar
                  </button>
                  <button type="submit" disabled={savingPass}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                               disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition">
                    {savingPass ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Cambiando...
                      </>
                    ) : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preferencias */}
          {activeSection === 'preferences' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Preferencias</h2>
              <div className="space-y-4">
                {[
                  { label: 'Notificaciones por email',    desc: 'Recibe alertas de facturas vencidas' },
                  { label: 'Resumen semanal',             desc: 'Recibe un resumen de actividad cada lunes' },
                  { label: 'Alertas de seguridad',        desc: 'Notificaciones de accesos al sistema' },
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between py-3
                                          border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{pref.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{pref.desc}</p>
                    </div>
                    <button
                      type="button"
                      className="w-11 h-6 bg-blue-600 rounded-full relative transition-colors">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}