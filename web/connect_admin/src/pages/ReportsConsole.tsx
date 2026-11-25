import { useState, useEffect, useCallback, useMemo } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import api, { getErrorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { ShieldAlert } from 'lucide-react'
import Button from '@/components/Button'

interface ReportRow {
  id: number
  reporter_id: number
  target_type: string
  target_id: number
  reason: string
  status: string
  resolved_by: number | null
  resolved_at: string | null
  created_at: string | null
}


export const ReportsConsole: React.FC = () => {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { clearAuth } = useAuthStore()

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (statusFilter !== 'all') params.status = statusFilter
      const { data } = await api.get<ReportRow[]>('/admin/reports', { params })
      setReports(data)
      setError('')
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const filtered = useMemo(
    () => reports.filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter)),
    [reports, statusFilter]
  )

  const handleResolve = useCallback(
    async (report: ReportRow, newStatus: 'resolved' | 'dismissed') => {
      try {
        await api.put(`/admin/reports/${report.id}/status`, undefined, {
          params: { status: newStatus },
        })
        await fetchReports()
      } catch (err: unknown) {
        alert(getErrorMessage(err) || 'Failed to update report')
      }
    },
    [fetchReports]
  )

  const handleLogout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'open': return 'bg-amber-100 text-amber-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'dismissed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Reports</h1>
            <p className="text-sm text-gray-500 mt-1">
              Moderate reported reviews, chats, profiles, and tours
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
            {['all', 'open', 'resolved', 'dismissed'].map((s) => (
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
              <ShieldAlert size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No reports found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-sm font-semibold text-gray-600">ID</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Reporter</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Target</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">Reason</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600 text-center">Status</th>
                    <th className="pb-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
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
                        <span className="text-sm text-gray-600">User #{r.reporter_id}</span>
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-gray-900">{r.target_type}</span>
                        <br />
                        <span className="text-xs text-gray-500">#{r.target_id}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-600">
                          {r.reason.length > 60 ? r.reason.slice(0, 60) + '…' : r.reason}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === 'open' && (
                            <>
                              <Button
                                variant="secondary"
                                className="w-auto min-w-[70px]"
                                onClick={() => handleResolve(r, 'resolved')}
                              >
                                Resolve
                              </Button>
                              <Button
                                variant="danger"
                                className="w-auto min-w-[70px]"
                                onClick={() => handleResolve(r, 'dismissed')}
                              >
                                Dismiss
                              </Button>
                            </>
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

ReportsConsole.displayName = 'ReportsConsole'
