import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createUser } from '../users.api';

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('END_USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createUser({
        email,
        password,
        fullName,
        roles: [role],
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Create New User</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="END_USER">End User</option>
              <option value="INTERNAL_ADMIN">Internal Admin</option>
              <option value="SUPPORT_STAFF">Support Staff</option>
              <option value="CONTENT_ADMIN">Content Admin</option>
              <option value="BANK_ADMIN">Bank Admin</option>
              <option value="BANK_MARKETER">Bank Marketer</option>
              <option value="BANK_ANALYST">Bank Analyst</option>
              <option value="BANK_VIEWER">Bank Viewer</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
