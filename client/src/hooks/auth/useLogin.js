import { loginApi } from "@/api/authApi"
import { useAuthStore } from '@/store/authStore'
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useLogin = () => {
    const setUser = useAuthStore((state) => state.setUser)
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: loginApi,

        onSuccess: (user) => {
            setUser(user)
            queryClient.setQueryData(['auth', 'me'], user)
        }
    })
}
