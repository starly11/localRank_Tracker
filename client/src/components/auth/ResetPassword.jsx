import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Lock } from "lucide-react"
import toast from "react-hot-toast"

import { useResetPassword } from "@/hooks/auth/useResetPassword"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useResetPassword()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")

  const onSubmit = async (values) => {
    if (!token) {
      toast.error("Reset token is missing from URL.")
      return
    }

    try {
      const response = await mutateAsync({
        token,
        password: values.password,
      })
      toast.success(response?.message || "Password reset successful.")
      navigate("/login", { replace: true })
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to reset password."
      toast.error(message)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.25),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.2),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.08),transparent_35%)]" />

      <div className="page-container flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-text-primary shadow-lg shadow-accent/30">
                LR
              </div>
              <span className="text-sm font-medium tracking-wide text-text-secondary">
                Local Rank Tracker
              </span>
            </div>

            <div>
              <CardTitle className="text-2xl font-semibold text-text-primary">
                Reset Password
              </CardTitle>
              <p className="mt-2 text-sm text-text-secondary">
                Enter your new password below.
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    placeholder="Enter new password"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    placeholder="Confirm new password"
                    {...register("confirmPassword", {
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary ui-transition hover:text-text-primary"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Updating..." : "RESET PASSWORD"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Back to{" "}
              <Link to="/login" className="font-medium text-accent ui-transition hover:text-accent-hover">
                login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

