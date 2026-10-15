import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types/wedding';
import { Shield, Lock, CheckCircle2, X } from 'lucide-react';

interface RoleLoginModalProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  onClose: () => void;
}

export const RoleLoginModal: React.FC<RoleLoginModalProps> = ({
  users,
  currentUser,
  onSelectUser,
  onClose,
}) => {
  const [selectedUserId, setSelectedUserId] = useState(currentUser.id);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const targetUser = users.find((u) => u.id === selectedUserId) || users[0];

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === targetUser.pin || pinInput === '1234') {
      onSelectUser(targetUser);
      onClose();
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in fade-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-rose-900 mb-2">
          <Shield className="w-5 h-5" />
          <h2 className="text-xl font-serif font-bold text-stone-900">
            Account Switcher & Role Security
          </h2>
        </div>

        <p className="text-xs text-stone-500 mb-6">
          Switch account identity to verify role-based permissions (RBAC) and encrypted access controls.
        </p>

        {/* User Card Selection */}
        <div className="space-y-2 mb-6 max-h-56 overflow-y-auto pr-1">
          {users.map((user) => {
            const isSelected = user.id === selectedUserId;
            return (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUserId(user.id);
                  setPinError(false);
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-rose-50 border-rose-400 ring-1 ring-rose-300'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-stone-300"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-xs font-semibold text-stone-900">
                      {user.name}
                    </h3>
                    <span className="text-[11px] text-stone-500 block">
                      {user.roleTitle}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-rose-700" />
                ) : (
                  <span className="text-[10px] text-stone-400">Select</span>
                )}
              </div>
            );
          })}
        </div>

        {/* PIN Verification Form */}
        <form onSubmit={handleAuthenticate} className="space-y-4 pt-4 border-t border-stone-100">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                <span>Security PIN for {targetUser.name.split(' ')[0]}</span>
              </label>
              <span className="text-[11px] text-stone-400">
                (Demo PIN: <strong className="font-mono text-stone-600">1234</strong>)
              </span>
            </div>

            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder="Enter PIN (1234)"
              className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-400"
            />

            {pinError && (
              <p className="text-[11px] text-red-600 mt-1">
                Incorrect PIN. Please use 1234.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded cursor-pointer"
            >
              Sign In as {targetUser.name.split(' ')[0]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
