import { baseUrl, getToken } from '../../utils/api'

// Action Types - Events
export const GET_EVENTS_REQUEST = 'pos/GET_EVENTS_REQUEST'
export const GET_EVENTS_SUCCESS = 'pos/GET_EVENTS_SUCCESS'
export const GET_EVENTS_FAILURE = 'pos/GET_EVENTS_FAILURE'

// Action Types - Categories
export const GET_CATEGORIES_REQUEST = 'pos/GET_CATEGORIES_REQUEST'
export const GET_CATEGORIES_SUCCESS = 'pos/GET_CATEGORIES_SUCCESS'
export const GET_CATEGORIES_FAILURE = 'pos/GET_CATEGORIES_FAILURE'

// Action Types - Create Transaction
export const CREATE_TRANSACTION_REQUEST = 'pos/CREATE_TRANSACTION_REQUEST'
export const CREATE_TRANSACTION_SUCCESS = 'pos/CREATE_TRANSACTION_SUCCESS'
export const CREATE_TRANSACTION_FAILURE = 'pos/CREATE_TRANSACTION_FAILURE'
export const CLEAR_TRANSACTION_SUCCESS = 'pos/CLEAR_TRANSACTION_SUCCESS'

// Action Types - History
export const GET_HISTORY_REQUEST = 'pos/GET_HISTORY_REQUEST'
export const GET_HISTORY_SUCCESS = 'pos/GET_HISTORY_SUCCESS'
export const GET_HISTORY_FAILURE = 'pos/GET_HISTORY_FAILURE'

// Action Types - Temp Transactions
export const GET_TEMP_TRANSACTIONS_REQUEST = 'pos/GET_TEMP_TRANSACTIONS_REQUEST'
export const GET_TEMP_TRANSACTIONS_SUCCESS = 'pos/GET_TEMP_TRANSACTIONS_SUCCESS'
export const GET_TEMP_TRANSACTIONS_FAILURE = 'pos/GET_TEMP_TRANSACTIONS_FAILURE'

// Action Types - Validate Temp
export const VALIDATE_TEMP_REQUEST = 'pos/VALIDATE_TEMP_REQUEST'
export const VALIDATE_TEMP_SUCCESS = 'pos/VALIDATE_TEMP_SUCCESS'
export const VALIDATE_TEMP_FAILURE = 'pos/VALIDATE_TEMP_FAILURE'

// Action Types - Dashboard
export const GET_DASHBOARD_REQUEST = 'pos/GET_DASHBOARD_REQUEST'
export const GET_DASHBOARD_SUCCESS = 'pos/GET_DASHBOARD_SUCCESS'
export const GET_DASHBOARD_FAILURE = 'pos/GET_DASHBOARD_FAILURE'

// Get Events
export const getEvents = () => async (dispatch) => {
  dispatch({ type: GET_EVENTS_REQUEST })
  try {
    const token = getToken()
    const res = await fetch(`${baseUrl}/api/events/get-all`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.message || 'Gagal mengambil event')
    }

    const events = Array.isArray(data) ? data : []
    dispatch({ type: GET_EVENTS_SUCCESS, payload: events })
    return { success: true, data: events }
  } catch (error) {
    dispatch({ type: GET_EVENTS_FAILURE, payload: error.message })
    return { success: false, error: error.message }
  }
}

// Get Categories
export const getCategories = (categoryType) => async (dispatch) => {
  if (!categoryType) {
    dispatch({ type: GET_CATEGORIES_SUCCESS, payload: [] })
    return { success: true, data: [] }
  }

  dispatch({ type: GET_CATEGORIES_REQUEST })
  try {
    const token = getToken()
    const res = await fetch(`${baseUrl}/api/${categoryType}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.message || 'Gagal mengambil kategori')
    }

    const categories = Array.isArray(data) ? data : []
    dispatch({ type: GET_CATEGORIES_SUCCESS, payload: categories })
    return { success: true, data: categories }
  } catch (error) {
    dispatch({ type: GET_CATEGORIES_FAILURE, payload: error.message })
    return { success: false, error: error.message }
  }
}

// Create Transaction
export const createTransaction = (formData) => async (dispatch) => {
  dispatch({ type: CREATE_TRANSACTION_REQUEST })
  try {
    const token = getToken()
    const fd = new FormData()
    fd.append('name', formData.name.trim())
    fd.append('phoneNumber', formData.phoneNumber.trim())
    fd.append('email', formData.email.trim())
    fd.append('address', formData.address.trim())
    fd.append('date', formData.date)
    fd.append('description', formData.description.trim())
    fd.append('categoryType', formData.categoryType)
    fd.append('categoryId', formData.categoryId || '')
    fd.append('amount', formData.amount.trim() || '0')
    fd.append('paymentMethod', (formData.paymentMethod || 'TUNAI').toString().toUpperCase().trim())
    fd.append('eventId', formData.eventId || '')
    if (formData.image) fd.append('image', formData.image)

    const res = await fetch(`${baseUrl}/api/pos/create-transaction`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.message || data?.error || 'Transaksi gagal')
    }

    dispatch({ type: CREATE_TRANSACTION_SUCCESS, payload: data })
    return { success: true, data }
  } catch (error) {
    dispatch({ type: CREATE_TRANSACTION_FAILURE, payload: error.message })
    return { success: false, error: error.message }
  }
}

// Clear Transaction Success
export const clearTransactionSuccess = () => (dispatch) => {
  dispatch({ type: CLEAR_TRANSACTION_SUCCESS })
}

// Search donors (donatur lama) via /api/pos/search-donatur
export const searchDonors = (search) => async (dispatch, getState) => {
  if (!search || !String(search).trim()) return { success: true, content: [] }
  try {
    const token = getToken()
    const params = new URLSearchParams({ search: String(search).trim() })
    const res = await fetch(`${baseUrl}/api/pos/search-donatur?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || 'Gagal mencari donatur')
    const content = Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : [])
    return { success: true, content }
  } catch (error) {
    return { success: false, error: error.message, content: [] }
  }
}

// Get History
export const getHistory = (filters) => async (dispatch) => {
  dispatch({ type: GET_HISTORY_REQUEST })
  try {
    const token = getToken()
    const params = new URLSearchParams()
    if (filters.startDate) params.set('startDate', filters.startDate)
    if (filters.endDate) params.set('endDate', filters.endDate)
    if (filters.category) params.set('category', filters.category)
    if (filters.eventId) params.set('eventId', filters.eventId)
    if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod)
    if (filters.search && String(filters.search).trim()) params.set('search', String(filters.search).trim())
    params.set('page', String(filters.page || 0))

    const res = await fetch(`${baseUrl}/api/pos/history?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.message || 'Gagal mengambil history')
    }

    dispatch({
      type: GET_HISTORY_SUCCESS,
      payload: {
        content: Array.isArray(data.content) ? data.content : [],
        totalPages: data.totalPages ?? 0,
        totalElements: data.totalElements ?? 0,
        number: data.number ?? 0,
      },
    })
    return { success: true, data }
  } catch (error) {
    dispatch({ type: GET_HISTORY_FAILURE, payload: error.message })
    return { success: false, error: error.message }
  }
}

// Get Temp Transactions
export const getTempTransactions = () => async (dispatch) => {
  dispatch({ type: GET_TEMP_TRANSACTIONS_REQUEST })
  try {
    const token = getToken()
    const res = await fetch(`${baseUrl}/api/transaction/temp`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.message || 'Gagal mengambil transaksi pending')
    }

    const list = Array.isArray(data) ? data : []
    dispatch({ type: GET_TEMP_TRANSACTIONS_SUCCESS, payload: list })
    return { success: true, data: list }
  } catch (error) {
    dispatch({ type: GET_TEMP_TRANSACTIONS_FAILURE, payload: error.message })
    return { success: false, error: error.message }
  }
}

// Validate Temp Transaction
export const validateTempTransaction = (nomorBukti) => async (dispatch) => {
  dispatch({ type: VALIDATE_TEMP_REQUEST, payload: nomorBukti })
  try {
    const token = getToken()
    const res = await fetch(`${baseUrl}/api/transaction/validate-temp/${encodeURIComponent(nomorBukti)}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data?.message || data?.error || 'Validasi gagal')
    }

    dispatch({ type: VALIDATE_TEMP_SUCCESS, payload: nomorBukti })
    return { success: true, data }
  } catch (error) {
    dispatch({ type: VALIDATE_TEMP_FAILURE, payload: { nomorBukti, error: error.message } })
    return { success: false, error: error.message }
  }
}

// Get Dashboard
export const getDashboard = () => async (dispatch) => {
  dispatch({ type: GET_DASHBOARD_REQUEST })
  try {
    const token = getToken()
    const res = await fetch(`${baseUrl}/api/pos/dashboard`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.message || 'Gagal mengambil dashboard')
    }

    dispatch({ type: GET_DASHBOARD_SUCCESS, payload: data })
    return { success: true, data }
  } catch (error) {
    dispatch({ type: GET_DASHBOARD_FAILURE, payload: error.message })
    return { success: false, error: error.message }
  }
}
