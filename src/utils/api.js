const getBaseUrl = () => {
  const url = (import.meta.env.VITE_API_URL || '').trim()
  return url.startsWith('http') ? url : `https://${url}`
}

export const baseUrl = getBaseUrl()

export const getToken = () => localStorage.getItem('token')

export const setToken = (token) => localStorage.setItem('token', token)

export const removeToken = () => localStorage.removeItem('token')
