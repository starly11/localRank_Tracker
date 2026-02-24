import { useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import Login from "./components/auth/Login"
import Signup from "./components/auth/Signup"
import ForgotPassword from "./components/auth/ForgotPassword"
import ResetPassword from "./components/auth/ResetPassword"
import PublicRoutes from "./routes/PublicRoutes"
import ProtectedRoutes from "./routes/ProtectedRoutes"
import Onboarding from "./pages/Onboarding"
import Dashboard from "./pages/Dashboard"
import Businesses from "./pages/Businesses"
import Reviews from "./pages/Reviews"
import Alerts from "./pages/Alerts"
import Settings from "./pages/Settings"
import Landing from "./pages/Landing"
import Help from "./pages/Help"
import NotFound from "./pages/NotFound"
import ServerError from "./pages/ServerError"
import { getMeApi } from "./api/authApi"
import { useAuthStore } from "./store/authStore"

const AuthHydrator = ({ children }) => {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const { data, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMeApi,
    enabled: !user,
  })

  useEffect(() => {
    if (data) {
      setUser(data)
    }
  }, [data, setUser])

  if (isLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-accent" />
      </div>
    )
  }

  return children
}

const GoogleAuthCallback = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth", "google-callback"],
    queryFn: async () => {
      // Extract token passed via ?token= from the Google OAuth redirect
      const params = new URLSearchParams(window.location.search)
      const token = params.get("token")

      if (token) {
        localStorage.setItem("token", token)
        // Clean the token out of the URL bar
        window.history.replaceState({}, document.title, "/auth/callback")
      }

      return getMeApi()
    },
    retry: false,
  })

  useEffect(() => {
    if (data) {
      setUser(data)
      navigate("/dashboard", { replace: true })
      return
    }

    if (!isLoading && (isError || data === null)) {
      navigate("/login", { replace: true })
    }
  }, [data, isLoading, isError, navigate, setUser])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="size-5 animate-spin text-accent" />
    </div>
  )
}

export const App = () => {
  return (
    <AuthHydrator>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/help" element={<Help />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="/auth/callback" element={<GoogleAuthCallback />} />
          {/* Public auth routes */}
          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>
          {/* Protected routes */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/businesses" element={<Businesses />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/reviews/:businessId" element={<Reviews />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthHydrator>
  )
}
