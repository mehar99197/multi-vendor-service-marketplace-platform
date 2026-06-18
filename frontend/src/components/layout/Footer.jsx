import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/5 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white font-black">
              T
            </span>
            <span className="text-lg font-bold text-white">
              Teyzix <span className="text-gradient">Core</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/services" className="text-sm text-gray-400 hover:text-white transition-colors">
              Services
            </Link>
            <Link to="/register" className="text-sm text-gray-400 hover:text-white transition-colors">
              Join
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Teyzix Core. Crafted with care.
          </p>
        </div>
      </div>
    </footer>
  )
}
