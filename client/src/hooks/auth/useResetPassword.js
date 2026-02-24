import { useMutation } from "@tanstack/react-query"
import { resetPasswordApi } from "@/api/authApi"

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPasswordApi,
  })
}

