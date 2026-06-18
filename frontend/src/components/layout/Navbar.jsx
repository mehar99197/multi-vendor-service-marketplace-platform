import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from './NotificationBell'

function NavLink({ to, children, onClick }) {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group relative text-sm transition-colors ${
        active ? 'text-white' : 'text-gray-300 hover:text-white'
      }`}
    >
      {children}
      <span
        className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400 transition-all duration-300 ${
          active ? 'w-full' : 'w-0 group-hover:w-full'
        }`}
      />
    </Link>
  )
}

export default function Navbar() {
  const { user, logout, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white font-black shadow-lg shadow-indigo-600/30 transition-transform group-hover:scale-105">
              T
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              Teyzix <span className="text-gradient">Core</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/services">Services</NavLink>
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
                  className="px-5 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 transition-all glow-indigo"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {user.role === 'provider' && (
                  <Link
                    to="/services/create"
                    className="px-3.5 py-1.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 transition-all glow-indigo"
                  >
                    + Create Service
                  </Link>
                )}
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/dashboard/profile">Profile</NavLink>
                <NotificationBell />
                <span className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span className="hidden lg:inline">{user.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-300 rounded-lg border border-white/10 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-gray-300 hover:text-white focus:outline-none"
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
        <div className="md:hidden glass border-t border-white/5">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Home
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Services
            </Link>
            {loading ? null : !user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-center font-semibold text-white rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {user.role === 'provider' && (
                  <Link
                    to="/services/create"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-center font-semibold text-white rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600"
                  >
                    + Create Service
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                  Profile
                </Link>
                <div className="px-3 py-2 text-sm text-gray-400">{user.name}</div>
                <button
                  onClick={() => {
                    logout()
                    setMobileOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-gray-300 rounded-md border border-white/10 hover:bg-white/5"
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
