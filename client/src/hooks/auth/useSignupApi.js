import { useAuthStore } from "@/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signupApi } from "@/api/authApi";

export const useSignupApi = () => {
    const setUser = useAuthStore((state) => state.setUser)
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: signupApi,
        onSuccess: (user) => {
            setUser(user)
            queryClient.setQueryData(['auth', 'me'], user)
        }
    })
}
