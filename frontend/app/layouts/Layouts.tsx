import { useState, useEffect } from 'react'
import { Link, useLocation, Outlet, useNavigate } from 'react-router'
import {
  LayoutDashboard,
  Coffee,
  Gamepad2,
  Cpu,
  Settings,
  Menu,
  X,
  CircleDot,
  User,
  LogOut
} from 'lucide-react'
import { isAuthenticated, getUser, logout } from '../utils/auth'

function Layouts() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUser()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
    }
  }, [navigate])

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Cafe Orders', icon: Coffee, href: '/cafe' },
    { name: 'Billiard Management', icon: Gamepad2, href: '/billyard' },
    { name: 'ESP32 Controls', icon: Cpu, href: '/esp32' },
    { name: 'Settings', icon: Settings, href: '/settings' }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isAuthenticated()) {
    return null // Will redirect to login
  }

  return (
    <div className="flex h-screen font-sans bg-gray-50">
      {/* Mobile menu toggle button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100 transition"
        >
          {sidebarOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <CircleDot className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Billiard Cafe</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map(({ name, href, icon: Icon }) => {
              const isActive = location.pathname === href

              return (
                <Link
                  key={name}
                  to={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-green-100 text-green-700 border-r-4 border-green-600 hover:bg-green-200'
                        : 'text-gray-600 hover:bg-green-100 hover:text-green-700'
                    }
                  `}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                      isActive ? 'text-green-700' : 'text-gray-500 group-hover:text-green-700'
                    }`}
                  />
                  {name}
                </Link>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 p-2 rounded-full">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                to="/profile"
                className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition"
              >
                <User className="h-3 w-3 mr-1" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Logout
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-500">
            Billiard Cafe POS v1.0
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="md:hidden" />
          <h1 className="text-lg font-semibold text-gray-800">Cafe & Billiard Admin</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">👤 {user?.name || 'Admin'}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white text-center text-xs text-gray-500 py-2 border-t">
          © {new Date().getFullYear()} Cafe & Billiard POS App
        </footer>
      </div>
    </div>
  )
}

export default Layouts
