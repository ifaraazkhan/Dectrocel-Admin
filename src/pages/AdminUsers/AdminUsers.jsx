import React, { useState, useEffect, useContext } from 'react';
import { Plus, X, UserCheck, UserX, Shield } from 'lucide-react';
import adminUsersAPI from '../../api/adminUsers';
import authAPI from '../../api/auth';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ─── Create Admin Modal ───────────────────────────────────────────────────────

const CreateAdminModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({ mobile: '', password: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({ mobile: '', password: '', confirmPassword: '' });
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.mobile.length !== 10 || !/^\d{10}$/.test(form.mobile)) {
      toast.error('Mobile must be exactly 10 digits');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const resp = await adminUsersAPI.create({ mobile: Number(form.mobile), password: form.password });
      if (resp.status_code === 'dc200') {
        toast.success('Admin user created');
        onSuccess();
        onClose();
      } else {
        toast.error(resp.message || 'Failed to create admin user');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin user');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Create Admin User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.mobile}
              onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
              placeholder="10-digit mobile number"
              maxLength={10}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Re-enter password"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Admin Users Page ─────────────────────────────────────────────────────────

const AdminUsers = () => {
  const { user } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  // Guard: only super admin can access
  if (user?.role !== 'SU') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Shield size={48} className="text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">Access Denied</h2>
        <p className="text-sm text-gray-400 mt-1">Only Super Admins can manage admin users.</p>
      </div>
    );
  }

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const resp = await adminUsersAPI.getAll();
      if (resp.status_code === 'dc200') {
        setAdmins(resp.results);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch admin users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    authAPI.get2FASetting()
      .then(resp => { if (resp.status_code === 'dc200') setTwoFaEnabled(resp.results.two_fa_enabled); })
      .catch(() => {});
  }, []);

  const handleToggle2FA = async () => {
    setTwoFaLoading(true);
    try {
      const resp = await authAPI.set2FASetting(!twoFaEnabled);
      if (resp.status_code === 'dc200') {
        setTwoFaEnabled(prev => !prev);
        toast.success(resp.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update 2FA setting');
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    const newStatus = admin.status === 'A' ? 'I' : 'A';
    setTogglingId(admin.user_id);
    try {
      const resp = await adminUsersAPI.updateStatus(admin.user_id, newStatus);
      if (resp.status_code === 'dc200') {
        toast.success(newStatus === 'A' ? 'Admin user activated' : 'Admin user blocked');
        fetchAdmins();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage admin accounts — visible to Super Admin only</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Add Admin
        </button>
      </div>

      {/* 2FA Toggle — SU only */}
      <div className={`mb-6 flex items-center justify-between p-4 rounded-lg border ${
        twoFaEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div>
          <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication (2FA)</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {twoFaEnabled
              ? 'All admin logins require OTP verification via SMS'
              : 'Admins log in with password only — no OTP required'}
          </p>
        </div>
        <button
          onClick={handleToggle2FA}
          disabled={twoFaLoading}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
            twoFaEnabled ? 'bg-green-500' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={twoFaEnabled}
        >
          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
            twoFaEnabled ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No admin users yet. Create one to get started.
                  </td>
                </tr>
              ) : admins.map((admin) => (
                <tr key={admin.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {String(admin.mobile)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      admin.status === 'A'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {admin.status === 'A' ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(admin)}
                      disabled={togglingId === admin.user_id}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 font-medium rounded-md transition-colors disabled:opacity-50 ${
                        admin.status === 'A'
                          ? 'text-red-600 border border-red-200 hover:bg-red-50'
                          : 'text-green-600 border border-green-200 hover:bg-green-50'
                      }`}
                    >
                      {togglingId === admin.user_id ? (
                        'Updating...'
                      ) : admin.status === 'A' ? (
                        <><UserX size={13} /> Block</>
                      ) : (
                        <><UserCheck size={13} /> Activate</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateAdminModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={fetchAdmins}
      />
    </div>
  );
};

export default AdminUsers;
