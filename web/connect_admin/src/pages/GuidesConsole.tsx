import { useState, useEffect } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { ShieldCheck, Search } from 'lucide-react'
import Button from '@/components/Button'

interface GuideRow {
  id: number
  email: string
  role: string
  is_active: boolean
  guide_profile: {
    id: number | null
    bio: string | null
    verification_status: string | null
    rating_avg: number | null
    total_earnings: number | null
    available_balance: number | null
  } | null
  created_at: string | null
}

export const GuidesConsole: React.FC = () => {
  const [guides, setGuides] = useState<GuideRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { clearAuth } = useAuthStore()

  const fetchGuides = async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (search) params.search = search
      const { data } = await api.get<GuideRow[]>('/admin/guides', { params })
      setGuides(data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load guides')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuides()
  }, [search, statusFilter])

  const filtered = guides.filter((g) => {
    const matchesSearch =
      g.email.toLowerCase().includes(search.toLowerCase()) ||
      (g.guide_profile?.bio?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchesStatus =
      statusFilter === 'all' ||
      g.guide_profile?.verification_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleLogout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Guides Console</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage guide accounts and verification status
            </p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Search size={18} className="mr-2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or bio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="w-full md:w-64">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No guides found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-sm font-semibold text-gray-600">Email</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Earnings</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Balance</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <ShieldCheck
                            size={16}
                            className={
                              g.guide_profile?.verification_status === 'approved'
                                ? 'text-green-500'
                                : 'text-gray-400'
                            }
                          />
                          <span className="font-medium text-gray-900">{g.email}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {new Date(g.created_at || '').toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          g.guide_profile?.verification_status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : g.guide_profile?.verification_status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {g.guide_profile?.verification_status ?? 'n/a'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-gray-900">
                          ${(g.guide_profile?.total_earnings ?? 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-gray-900">
                          ${(g.guide_profile?.available_balance ?? 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          variant="secondary"
                          className="w-full px-3 py-1.5 text-xs"
                          onClick={() => window.location.href = `/verifications`}
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

GuidesConsole.displayName = 'GuidesConsole'
