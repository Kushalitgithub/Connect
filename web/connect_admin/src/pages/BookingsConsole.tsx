import { useState, useEffect } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Users, Clock } from 'lucide-react'
import Button from '@/components/Button'

interface BookingRow {
  id: number
  tourist_id: number
  tour_listing_id: number
  status: string
  date: string | null
  created_at: string | null
  updated_at: string | null
}

export const BookingsConsole: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { clearAuth } = useAuthStore()

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (statusFilter !== 'all') params.status = statusFilter
      const { data } = await api.get<BookingRow[]>('/admin/bookings', { params })
      setBookings(data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const filtered = bookings.filter((b) => {
    if (statusFilter === 'all') return true
    return b.status === statusFilter
  })

  const handleStatusChange = async (booking: BookingRow, newStatus: string) => {
    try {
      await api.put(`/admin/bookings/${booking.id}/status`, undefined, {
        params: { status: newStatus },
      })
      await fetchBookings()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update booking')
    }
  }

  const handleLogout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'accepted': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'declined': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Bookings Console</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and resolve booking disputes across the platform
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
          <div className="flex gap-4 mb-6">
            {['all', 'pending', 'accepted', 'completed', 'cancelled', 'declined'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-sm font-semibold text-gray-600">ID</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Tourist</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Tour</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600 text-center">Status</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4">
                        <span className="text-xs font-mono text-gray-500">#{b.id}</span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Users size={14} className="text-gray-400" />
                          <span className="font-medium text-gray-900">Tourist #{b.tourist_id}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-gray-900">Tour #{b.tour_listing_id}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-600">
                          {b.date ? new Date(b.date).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.status === 'pending' && (
                            <>
                              <Button
                                variant="secondary"
                                className="w-auto min-w-[70px]"
                                onClick={() => handleStatusChange(b, 'accepted')}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="danger"
                                className="w-auto min-w-[70px]"
                                onClick={() => handleStatusChange(b, 'declined')}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {b.status !== 'pending' && b.status !== 'cancelled' && (
                            <Button
                              variant="secondary"
                              className="w-auto min-w-[70px]"
                              onClick={() => handleStatusChange(b, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          )}
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

BookingsConsole.displayName = 'BookingsConsole'
