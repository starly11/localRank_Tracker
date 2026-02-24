import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from '@/store/authStore'

const PublicRoutes = () => {
    const user = useAuthStore(state => state.user)

    if (user) {
        return <Navigate to='/dashboard' replace />
    }

    return <Outlet />
}

export default PublicRoutes
