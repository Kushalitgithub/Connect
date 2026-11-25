import { useState, useEffect, useCallback, useMemo } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import api, { getErrorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Compass, Search, Trash2 } from 'lucide-react'
import Button from '@/components/Button'

interface TourRow {
  id: number
  title: string
  description: string | null
  price: number
  capacity: number
  active: boolean
  guide_id: number
  guide_email?: string
  created_at: string | null
  updated_at: string | null
}


export const ToursConsole: React.FC = () => {
  const [tours, setTours] = useState<TourRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const { clearAuth } = useAuthStore()

  const fetchTours = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (activeFilter !== 'all') params.status = activeFilter
      if (search) params.search = search
      const { data } = await api.get<TourRow[]>('/admin/tours', { params })
      setTours(data)
      setError('')
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to load tours')
    } finally {
      setLoading(false)
    }
  }, [search, activeFilter])

  useEffect(() => {
    fetchTours()
  }, [fetchTours])

  const filtered = useMemo(
    () =>
      tours.filter((t) => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
        const matchesActive =
          activeFilter === 'all' || (activeFilter === 'active') === t.active
        return matchesSearch && matchesActive
      }),
    [tours, search, activeFilter]
  )

  const handleToggleActive = useCallback(async (tour: TourRow) => {
    try {
      await api.put(`/admin/dashboard/tours/${tour.id}`, undefined, {
        params: { active: !tour.active },
      })
      await fetchTours()
    } catch (err: unknown) {
      alert(getErrorMessage(err) || 'Failed to update tour')
    }
  }, [fetchTours])

  const handleDelete = useCallback(async (tour: TourRow) => {
    if (!confirm('Delete this tour? This cannot be undone.')) return
    try {
      await api.put(`/admin/dashboard/tours/${tour.id}`, undefined, {
        params: { active: false },
      })
      await fetchTours()
    } catch (err: unknown) {
      alert(getErrorMessage(err) || 'Failed to delete tour')
    }
  }, [fetchTours])

  const handleLogout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Tours Console</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage published tour listings across all guides
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
                placeholder="Search by tour title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="w-full md:w-64">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="all">All Tours</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No tours found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-sm font-semibold text-gray-600">Title</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600 text-right">Price</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600 text-center">Capacity</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600 text-center">Status</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Compass size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900">{t.title}</span>
                        </div>
                        {t.description && (
                          <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <span className="font-medium text-gray-900">${t.price}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-xs text-gray-500">{t.capacity}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          t.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {t.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            className="w-auto min-w-[80px]"
                            onClick={() => handleToggleActive(t)}
                          >
                            {t.active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="danger"
                            className="w-auto min-w-[80px]"
                            onClick={() => handleDelete(t)}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Remove
                          </Button>
                        </div>
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

ToursConsole.displayName = 'ToursConsole'
