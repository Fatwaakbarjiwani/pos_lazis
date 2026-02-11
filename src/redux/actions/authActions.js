import { baseUrl, setToken, getToken, removeToken } from '../../utils/api'

export const LOGIN_REQUEST = 'auth/LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'auth/LOGIN_FAILURE'
export const GET_ME_REQUEST = 'auth/GET_ME_REQUEST'
export const GET_ME_SUCCESS = 'auth/GET_ME_SUCCESS'
export const GET_ME_FAILURE = 'auth/GET_ME_FAILURE'
export const LOGOUT = 'auth/LOGOUT'

export const loginUser = (emailOrPhoneNumber, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST })
  try {
    const res = await fetch(`${baseUrl}/api/auth/agen/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhoneNumber, password }),
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.message || data?.error || 'Login gagal')
    }

    const token = data?.data?.token || data?.token
    if (token) {
      setToken(token)
    }

    dispatch({ type: LOGIN_SUCCESS, payload: { token, user: data?.data?.user ?? data?.user ?? data?.data } })
    return { success: true, data }
  } catch (error) {
    dispatch({ type: LOGIN_FAILURE, payload: error.message })
    return { success: false, error: error.message }
  }
}

export const getMe = () => async (dispatch) => {
  const token = getToken()
  if (!token) return { success: false, error: 'No token' }

  dispatch({ type: GET_ME_REQUEST })
  try {
    const res = await fetch(`${baseUrl}/api/agen/get-me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()

    if (!res.ok) {
      removeToken()
      throw new Error(data?.message || data?.error || 'Session expired')
    }

    const user = data?.data || data
    dispatch({ type: GET_ME_SUCCESS, payload: user })
    return { success: true, data: user }
  } catch (error) {
    dispatch({ type: GET_ME_FAILURE, payload: error.message })
    return { success: false, error: error.message }
  }
}

export const logoutUser = () => (dispatch) => {
  removeToken()
  dispatch({ type: LOGOUT })
}
