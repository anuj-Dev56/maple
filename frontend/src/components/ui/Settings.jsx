import React, { useState } from 'react';
import { useAuth } from "../Auth/AuthlayoutWrapper";
import { Preferences } from '@capacitor/preferences';
import toast from 'react-hot-toast';

const Settings = () => {
  const { account, refetch } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: account?.personal?.username || '',
    email: account?.personal?.email || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await Preferences.get({ key: "token" });
      const token = result.value;

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            personal: {
              username: formData.username,
              email: formData.email,
              avatar: formData.avatar,
            }
          })
        }
      );

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await res.json();
      toast.success('Profile updated successfully!');
      refetch?.();
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400">Please log in to access settings</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-black to-zinc-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-zinc-400">Manage your account and profile information</p>
        </div>

        {/* Settings Card */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="Enter username"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="Enter email"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Account ID:</span>
              <span className="text-zinc-200">{account?._id || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Member Since:</span>
              <span className="text-zinc-200">
                {new Date(account?.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
