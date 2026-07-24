"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/utils/firebase"
import { doc, setDoc } from "firebase/firestore"
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut, 
  sendPasswordResetEmail,
  signInWithCustomToken
} from "firebase/auth"

const AuthContext = createContext({})

const isBypassEnabled =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

const MOCK_DEV_USER = {
  uid: "dev-user-123",
  id: "dev-user-123",
  email: "dev@example.com",
  displayName: "Dev User",
  user_metadata: {
    full_name: "Dev User",
  },
};

// Shim to make Firebase user object compatible with existing Supabase references
const formatUser = (firebaseUser) => {
  if (!firebaseUser) return isBypassEnabled ? MOCK_DEV_USER : null;
  return {
    ...firebaseUser,
    id: firebaseUser.uid, // Supabase uses user.id
    user_metadata: {
      full_name: firebaseUser.displayName || firebaseUser.email || "Dev User", // Supabase uses user.user_metadata.full_name
    }
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(isBypassEnabled ? MOCK_DEV_USER : null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Intercept Custom Token from Google OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const customToken = urlParams.get('customToken');
    let pendingCustomToken = !!customToken;

    if (customToken) {
      // Clear from URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      // Sign in; onAuthStateChanged will receive the user and clear loading
      signInWithCustomToken(auth, customToken)
        .catch(err => {
          console.error("Custom token login failed", err);
          pendingCustomToken = false;
          setLoading(false);
        });
    }

    // Listen for auth changes — skip the initial null if we're still signing in
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser && pendingCustomToken) {
        // Custom token sign-in hasn't resolved yet — keep loading
        return;
      }
      pendingCustomToken = false;
      setUser(formatUser(firebaseUser))
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
    router.push("/today")
  }

  const signup = async (email, password, fullName = '', level = '') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    if (fullName) {
      await updateProfile(userCredential.user, { displayName: fullName })
      // Update local state immediately after profile update
      setUser(formatUser({ ...userCredential.user, displayName: fullName }))
    }
    // Save additional profile data to Firestore
    try {
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName: fullName,
        email: email,
        level: level,
        created_at: new Date().toISOString()
      }, { merge: true })
    } catch (err) {
      console.error("Error saving user profile:", err)
    }
    router.push("/today")
  }

  const loginWithGoogle = async () => {
    window.location.href = '/api/auth/google';
  }

  const logout = async () => {
    await signOut(auth)
    router.push("/signin")
  }

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

