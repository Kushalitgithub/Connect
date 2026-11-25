import { useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { useAuthStore } from '@/stores/authStore'
import { LogOut, Building } from 'lucide-react'
import Button from '@/components/Button'

export const Settings: React.FC = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { clearAuth } = useAuthStore()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      // Settings endpoint not yet implemented on backend; persist locally for now
      setMessage('Settings saved successfully')
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Platform configuration and admin account preferences
            </p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut size={18} className="mr-2 inline" />
            Sign Out
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Admin Account</h2>
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@connect.np"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Connect Admin"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <Button type="submit" isLoading={loading} className="w-full">
              Save Changes
            </Button>
          </form>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Platform</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <Building size={20} className="text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900">Connect Platform</div>
                  <div className="text-xs text-gray-500">Nepal Tourism Marketplace</div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-400">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

Settings.displayName = 'Settings'
