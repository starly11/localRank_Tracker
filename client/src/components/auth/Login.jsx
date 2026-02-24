import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import toast from "react-hot-toast"

import { googleLoginApi } from "@/api/authApi"
import { useLogin } from "@/hooks/auth/useLogin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const { mutate, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Logged in successfully");
        navigate("/dashboard");
      },
      onError: (err) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Login failed";
        toast.error(message);
      },
    });
  };

  const onGoogleContinue = () => {
    try {
      googleLoginApi()
    } catch {
      toast.error("Google sign in is not available right now.")
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.25),
      transparent_35%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.2),transparent_30%),radial-gradient(circle_at_50%_80%,
      rgba(34,197,94,0.08),transparent_35%)]" />

      <div className="page-container flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-text-primary shadow-lg shadow-accent/30">
                LR
              </div>
              <span className="text-sm font-medium tracking-wide text-text-secondary">Local Rank Tracker</span>
            </div>

            <div>
              <CardTitle className="text-2xl font-semibold text-text-primary">Welcome Back</CardTitle>
              <p className="mt-2 text-sm text-text-secondary">Please enter your details.</p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-text-secondary ui-transition hover:text-accent"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="pl-10 pr-10"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary ui-transition hover:text-text-primary"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border bg-surface text-accent focus-visible:ring-2 focus-visible:ring-accent"
                  {...register("rememberMe")}
                />
                <Label htmlFor="rememberMe" className="text-sm text-text-secondary">
                  Remember me
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing In..." : "SIGN IN"}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wider text-text-secondary">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onGoogleContinue}
              disabled={isPending}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs font-semibold text-text-primary">
                G
              </span>
              Continue with Google
            </Button>

            <p className="mt-6 text-center text-sm text-text-secondary">
              New here?{" "}
              <Link to="/signup" className="font-medium text-accent ui-transition hover:text-accent-hover">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
