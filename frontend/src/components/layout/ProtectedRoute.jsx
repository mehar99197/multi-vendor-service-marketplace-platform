import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loading from '../common/Loading'

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-950">
        <Loading />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return children || <Outlet />
}
