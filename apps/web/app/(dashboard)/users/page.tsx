'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUsers, createUser, deactivateUser, UserDetail } from '@/lib/api';

const ROLE_LABELS: Record<string, { label: string; classes: string }> = {
  ADMIN:    { label: 'Administrador', classes: 'bg-blue-50 text-blue-700 border-blue-200'   },
  EMPLOYEE: { label: 'Empleado',      classes: 'bg-green-50 text-green-700 border-green-200' },
  VIEWER:   { label: 'Visualizador',  classes: 'bg-gray-50 text-gray-600 border-gray-200'   },
};

export default function UsersPage() {
  const { token, user: currentUser } = useAuth();

  const [users, setUsers]       = useState<UserDetail[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving]     = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'EMPLOYEE' as const,
  });

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getUsers(token);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError('');
    try {
      await createUser(token, form);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'EMPLOYEE' });
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message ?? 'Error al crear el usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!token) return;
    if (!confirm('¿Desactivar este usuario?')) return;
    await deactivateUser(token, id);
    fetchUsers();
  };

  const activeUsers   = users.filter(u => u.active).length;
  const adminCount    = users.filter(u => u.role === 'ADMIN').length;
  const employeeCount = users.filter(u => u.role === 'EMPLOYEE').length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gestiona los accesos al sistema de tu empresa
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Usuarios Activos</p>
          <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Administradores</p>
          <p className="text-2xl font-bold text-blue-600">{adminCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Empleados</p>
          <p className="text-2xl font-bold text-green-600">{employeeCount}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                Usuario
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                Rol
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                Estado
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                Miembro desde
              </th>
              <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  <svg className="animate-spin w-6 h-6 mx-auto mb-2 text-blue-500"
                    fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Cargando usuarios...
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <tr key={u.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition
                              ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>

                  {/* Usuario */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center
                                       flex-shrink-0 font-bold text-sm
                                       ${u.active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {u.name}
                          {u.id === currentUser?.id && (
                            <span className="ml-2 text-xs text-blue-500 font-normal">(tú)</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Rol */}
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border
                                     ${ROLE_LABELS[u.role].classes}`}>
                      {ROLE_LABELS[u.role].label}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${u.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={`text-sm ${u.active ? 'text-green-700' : 'text-gray-400'}`}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>

                  {/* Fecha */}
                  <td className="px-5 py-4 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('es-MX', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {/* No puede desactivarse a sí mismo */}
                      {u.id !== currentUser?.id && u.active && (
                        <button
                          onClick={() => handleDeactivate(u.id)}
                          title="Desactivar usuario"
                          className="p-1.5 hover:bg-red-50 rounded-lg transition
                                     text-gray-400 hover:text-red-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal nuevo usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Nuevo Usuario</h2>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                           hover:bg-gray-100 transition text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {formError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg
                                text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required placeholder="Nombre completo"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent placeholder:text-gray-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required placeholder="correo@empresa.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent placeholder:text-gray-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required placeholder="Mínimo 8 caracteres"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent placeholder:text-gray-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent transition bg-white"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="EMPLOYEE">Empleado</option>
                  <option value="VIEWER">Visualizador</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm
                             font-medium text-gray-600 hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                             text-white text-sm font-semibold rounded-lg transition
                             flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Guardando...
                    </>
                  ) : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}