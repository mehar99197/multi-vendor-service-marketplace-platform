import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, logout, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              Teyzix <span className="text-indigo-500">Core</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
              Services
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {loading ? null : !user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {user.role === 'provider' && (
                  <Link
                    to="/services/create"
                    className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    + Create Service
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Profile
                </Link>
                <NotificationBell />
                <span className="text-sm text-gray-400">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            <NotificationBell />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-gray-400 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-gray-300 hover:text-white rounded-md"
            >
              Home
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-gray-300 hover:text-white rounded-md"
            >
              Services
            </Link>
            {loading ? null : !user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-gray-300 hover:text-white rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 bg-indigo-600 text-white rounded-md"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {user.role === 'provider' && (
                  <Link
                    to="/services/create"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 bg-indigo-600 text-white rounded-md"
                  >
                    + Create Service
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-gray-300 hover:text-white rounded-md"
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-gray-300 hover:text-white rounded-md"
                >
                  Profile
                </Link>
                <div className="px-3 py-2 text-sm text-gray-400">{user.name}</div>
                <button
                  onClick={() => {
                    logout()
                    setMobileOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 bg-red-600 text-white rounded-md"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
