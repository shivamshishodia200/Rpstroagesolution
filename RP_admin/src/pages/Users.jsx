import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users as UsersIcon, UserPlus, Shield, Check, X, AlertCircle } from 'lucide-react';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'content_editor',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/users/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      const res = await adminApi.post('/users/users', form);
      if (res.data.success) {
        setShowModal(false);
        setForm({ name: '', email: '', password: '', role: 'content_editor' });
        fetchUsers();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.patch(`/users/users/${userId}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await adminApi.patch(`/users/users/${userId}`, { isActive: !currentActive });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Users & Access Control</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage administrative staff, SEO engineers, and content editors with role-based access control.
          </p>
        </div>
        {currentUser?.role === 'super_admin' && (
          <button
            onClick={() => {
              setErrorMsg('');
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E85B12] text-white rounded-lg hover:bg-[#c4490b] text-sm font-semibold shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Admin User
          </button>
        )}
      </div>

      {/* Role Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-purple-200/60 shadow-sm bg-purple-50/20">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" /> Super Admin
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Full system control. Can invite users, manage system settings, view audit logs, and publish any page.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200/60 shadow-sm bg-blue-50/20">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" /> SEO Manager
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Manages cities, city-product combinations, metadata, and approves content for publication.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/60 shadow-sm bg-emerald-50/20">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" /> Content Editor
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Can draft and edit products, specifications, and city content. Cannot publish without review approval.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading user accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">No admin users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Name & Email</th>
                  <th className="py-3 px-4">Role Assigned</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  {currentUser?.role === 'super_admin' && (
                    <th className="py-3 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{u.name}</div>
                      <div className="text-gray-500 text-[11px] font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      {currentUser?.role === 'super_admin' && u._id !== currentUser.id ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#E85B12]"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="seo_manager">SEO Manager</option>
                          <option value="content_editor">Content Editor</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            u.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-700'
                              : u.role === 'seo_manager'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {u.role.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          <X className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    {currentUser?.role === 'super_admin' && (
                      <td className="py-3 px-4 text-right">
                        {u._id !== currentUser.id && (
                          <button
                            onClick={() => handleToggleActive(u._id, u.isActive)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                              u.isActive
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Create Admin User</h2>
            <p className="text-xs text-gray-500 mb-4">
              Add a team member with dedicated role permissions.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rajesh Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E85B12]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., rajesh@rpstorage.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E85B12]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E85B12]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assign Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E85B12] bg-white font-medium"
                >
                  <option value="content_editor">Content Editor (Drafts only)</option>
                  <option value="seo_manager">SEO Manager (Edit & Review)</option>
                  <option value="super_admin">Super Admin (Full permissions)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#E85B12] text-white rounded-lg hover:bg-[#c4490b] font-semibold disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
