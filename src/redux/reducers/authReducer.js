import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  GET_ME_REQUEST,
  GET_ME_SUCCESS,
  GET_ME_FAILURE,
  LOGOUT,
} from '../actions/authActions'

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
}

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
    case GET_ME_REQUEST:
      return { ...state, loading: true, error: null }
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        token: action.payload?.token || null,
        user: action.payload?.user || null,
        error: null,
      }
    case LOGIN_FAILURE:
    case GET_ME_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        user: null,
        token: null,
      }
    case GET_ME_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        error: null,
      }
    case LOGOUT:
      return initialState
    default:
      return state
  }
}
