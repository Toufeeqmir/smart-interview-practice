import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/95 border-b border-default sticky top-0 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-accent font-bold text-xl">FER System</h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-accent bg-accent/10 border border-accent/20'
                    : 'text-text2 hover:text-accent hover:bg-accent/5'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/session"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/5'
                }`
              }
            >
              Live Session
            </NavLink>
            <NavLink
              to="/report"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/5'
                }`
              }
            >
              Analytics
            </NavLink>
            {user && (
              <div className="flex items-center space-x-4 ml-8">
                <span className="text-sm text-slate-400">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-slate-400 hover:text-cyan-400 p-2 rounded-lg transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-md border-t border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLink
                to="/"
                end
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                      : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/5'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/session"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                      : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/5'
                  }`
                }
              >
                Live Session
              </NavLink>
              <NavLink
                to="/report"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                      : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/5'
                  }`
                }
              >
                Analytics
              </NavLink>
              {user && (
                <div className="pt-4 pb-3 border-t border-slate-700">
                  <div className="px-3">
                    <div className="text-sm text-slate-400 mb-2">Logged in as</div>
                    <div className="text-sm font-medium text-white mb-3">{user.name}</div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-300"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-20 min-h-screen">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/50 backdrop-blur-md border-t border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold text-cyan-400">FER System</h3>
              <p className="text-sm text-slate-400 mt-1">Facial Expression Recognition Project</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <NavLink to="/" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300">Dashboard</NavLink>
              <NavLink to="/session" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300">Live Session</NavLink>
              <NavLink to="/report" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300">Analytics</NavLink>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-sm text-slate-400">© 2026 Facial Expression Recognition System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
