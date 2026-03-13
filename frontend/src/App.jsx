import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login      from './pages/Login'
import Register   from './pages/Register'
import Dashboard  from './pages/Dashboard'
import Session    from './pages/Session'
import Report     from './pages/Report'
import Layout     from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-[var(--accent)] font-[var(--font-display)] text-xl">Loading...</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index          element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
            <Route path="session" element={<ErrorBoundary><Session /></ErrorBoundary>} />
            <Route path="report"  element={<ErrorBoundary><Report /></ErrorBoundary>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
