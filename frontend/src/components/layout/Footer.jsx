import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-400 hover:text-gray-200 transition-colors text-sm">
              Home
            </Link>
            <Link to="/services" className="text-gray-400 hover:text-gray-200 transition-colors text-sm">
              Services
            </Link>
            <Link to="/about" className="text-gray-400 hover:text-gray-200 transition-colors text-sm">
              About
            </Link>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; 2024 Teyzix Core. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
