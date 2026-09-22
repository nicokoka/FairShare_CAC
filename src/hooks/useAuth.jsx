import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase.js'

/*
 * Auth is app-wide state, so it lives in a React context. <AuthProvider> wraps
 * the whole app (see main.jsx) and any component reads the current user with the
 * useAuth() hook — no prop drilling.
 *
 * Firebase's onAuthStateChanged fires once on load (telling us if a session was
 * restored) and again on every sign-in/sign-out. We mirror that into React state.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // `loading` is true until Firebase reports the initial auth state. It stops the
  // UI from flashing the signed-out view for a moment on every page refresh.
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    // Detach the listener when the provider unmounts.
    return unsubscribe
  }, [])

  const signIn = () => signInWithPopup(auth, googleProvider)
  const signOut = () => firebaseSignOut(auth)

  const value = { user, loading, signIn, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Convenience hook so components just call useAuth() instead of useContext(...).
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return context
}
