import { useMutation } from "@tanstack/react-query"
import { forgotPasswordApi } from "@/api/authApi"

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPasswordApi,
  })
}

