import { api } from './axios'

// login
export const loginApi = async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    const { user, token } = res.data
    if (token) {
        localStorage.setItem('token', token)
    }
    return user
}

// logout
export const logoutApi = async () => {
    const res = await api.post('/auth/logout')
    localStorage.removeItem('token')
    return res.data
}

export const deleteAccountApi = async (confirmation) => {
    const res = await api.delete('/auth/account', { data: { confirmation } })
    return res.data
}

// signup
export const signupApi = async (data) => {
    const res = await api.post('/auth/signup', data)
    const { user, token } = res.data
    if (token) {
        localStorage.setItem('token', token)
    }
    return user
}

// forgot password
export const forgotPasswordApi = async (data) => {
    const res = await api.post('/auth/forgot-password', data)
    return res.data
}

// reset password
export const resetPasswordApi = async ({ token, password }) => {
    const res = await api.post(`/auth/reset-password/${token}`, { password })
    return res.data
}

export const updateProfileApi = async (payload) => {
    const res = await api.patch('/auth/profile', payload)
    return res.data?.user
}

export const updateNotificationSettingsApi = async (payload) => {
    const res = await api.patch('/auth/settings/notifications', payload)
    return res.data?.user
}

export const changePasswordApi = async (payload) => {
    const res = await api.patch('/auth/password', payload)
    return res.data
}

// google login
export const googleLoginApi = async () => {
    const baseURL = api?.defaults?.baseURL
    window.location.href = `${baseURL}/auth/google`
}

// getMe
export const getMeApi = async () => {
    try {
        const res = await api.get('/auth/me')
        return res.data.user || null
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return null
        }
        throw error
    }
}
