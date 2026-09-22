import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import LoadingScreen from '../common/LoadingScreen.jsx'

/*
 * Wraps any route that requires a signed-in user. While Firebase is still
 * restoring the session we show a loading screen; once we know there's no user,
 * we bounce to the landing page. Signed-in users see the wrapped page.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/" replace />
  return children
}
