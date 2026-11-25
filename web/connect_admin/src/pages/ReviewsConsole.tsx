import { useState, useEffect } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Star, Search } from 'lucide-react'
import Button from '@/components/Button'

interface ReviewRow {
  id: number
  booking_id: number
  tourist_id: number
  guide_id: number
  rating: number
  body: string | null
  created_at: string | null
}

export const ReviewsConsole: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const { clearAuth } = useAuthStore()

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const { data } = await api.get<ReviewRow[]>('/admin/reviews')
      setReviews(data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const filtered = reviews.filter((r) => {
    if (!search) return true
    return String(r.id).includes(search) || String(r.booking_id).includes(search)
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
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Reviews Moderation</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor guide reviews left by tourists after completed tours
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
            <div className="flex-1">
              <Search size={18} className="mr-2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by review or booking id..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reviews found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-sm font-semibold text-gray-600">ID</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Booking</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Tourist</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Guide</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600 text-center">Rating</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Body</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4">
                        <span className="text-xs font-mono text-gray-500">#{r.id}</span>
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-gray-900">#{r.booking_id}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-600">Tourist #{r.tourist_id}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-600">Guide #{r.guide_id}</span>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= r.rating ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-600">
                          {r.body ?? 'No comment'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-xs text-gray-500">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                        </span>
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

ReviewsConsole.displayName = 'ReviewsConsole'
