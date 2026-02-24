import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Mail } from "lucide-react"
import toast from "react-hot-toast"

import { useForgotPassword } from "@/hooks/auth/useForgotPassword"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPassword() {
  const [resetUrl, setResetUrl] = useState("")
  const { mutateAsync, isPending } = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (values) => {
    try {
      const response = await mutateAsync({ email: values.email })
      toast.success(response?.message || "Reset instructions sent.")
      setResetUrl(response?.resetUrl || "")
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to request password reset."
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
                Forgot Password
              </CardTitle>
              <p className="mt-2 text-sm text-text-secondary">
                Enter your account email and we will send reset instructions.
              </p>
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
                    className="pl-10"
                    placeholder="you@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-danger">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Sending..." : "SEND RESET LINK"}
              </Button>
            </form>

            {resetUrl && (
              <div className="mt-4 rounded-md border border-border bg-surface p-3 text-xs text-text-secondary">
                <p className="mb-2 font-medium text-text-primary">Dev reset link:</p>
                <a
                  href={resetUrl}
                  className="break-all text-accent hover:text-accent-hover"
                  target="_blank"
                  rel="noreferrer"
                >
                  {resetUrl}
                </a>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-text-secondary">
              Remembered your password?{" "}
              <Link to="/login" className="font-medium text-accent ui-transition hover:text-accent-hover">
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

