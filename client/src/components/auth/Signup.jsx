import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import toast from "react-hot-toast"

import { googleLoginApi } from "@/api/authApi"
import { useSignupApi } from "@/hooks/auth/useSignupApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Signup() {
    const { mutate, isPending } = useSignupApi()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const password = watch("password")

    const onSubmit = (data) => {
        mutate(
            {
                name: data.name,
                email: data.email,
                password: data.password,
            },
            {
                onSuccess: () => {
                    toast.success("Account created")
                    navigate("/onboarding")
                },
                onError: (err) => {
                    toast.error(
                        err?.response?.data?.message || "Signup failed"
                    );
                },
            }
        )
    }

    const onGoogleContinue = () => {
        try {
            googleLoginApi()
        } catch {
            toast.error("Google sign up is not available right now.")
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
                            <span className="text-sm font-medium tracking-wide text-text-secondary">Local Rank Tracker</span>
                        </div>

                        <div>
                            <CardTitle className="text-2xl font-semibold text-text-primary">Create your account</CardTitle>
                            <p className="mt-2 text-sm text-text-secondary">Set up your details to get started.</p>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
                                    <Input
                                        id="name"
                                        className="pl-10"
                                        placeholder="John Doe"
                                        {...register("name", { required: "Name is required" })}
                                    />
                                </div>
                                {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
                            </div>

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
                                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className="pl-10 pr-10"
                                        placeholder="Create password"
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
                                        placeholder="Confirm password"
                                        {...register("confirmPassword", {
                                            validate: (value) => value === password || "Passwords do not match",
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
                                {isPending ? "Creating account..." : "SIGN UP"}
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
                            Already have an account?{" "}
                            <Link to="/login" className="font-medium text-accent ui-transition hover:text-accent-hover">
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
