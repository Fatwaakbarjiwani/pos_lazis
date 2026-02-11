import {
  GET_EVENTS_REQUEST,
  GET_EVENTS_SUCCESS,
  GET_EVENTS_FAILURE,
  GET_CATEGORIES_REQUEST,
  GET_CATEGORIES_SUCCESS,
  GET_CATEGORIES_FAILURE,
  CREATE_TRANSACTION_REQUEST,
  CREATE_TRANSACTION_SUCCESS,
  CREATE_TRANSACTION_FAILURE,
  CLEAR_TRANSACTION_SUCCESS,
  GET_HISTORY_REQUEST,
  GET_HISTORY_SUCCESS,
  GET_HISTORY_FAILURE,
  GET_TEMP_TRANSACTIONS_REQUEST,
  GET_TEMP_TRANSACTIONS_SUCCESS,
  GET_TEMP_TRANSACTIONS_FAILURE,
  VALIDATE_TEMP_REQUEST,
  VALIDATE_TEMP_SUCCESS,
  VALIDATE_TEMP_FAILURE,
  GET_DASHBOARD_REQUEST,
  GET_DASHBOARD_SUCCESS,
  GET_DASHBOARD_FAILURE,
} from '../actions/posActions'

const initialState = {
  // Events
  events: [],
  loadingEvents: false,
  errorEvents: null,

  // Categories
  categories: [],
  loadingCategories: false,
  errorCategories: null,

  // Transaction
  transactionSuccess: null,
  submitting: false,
  errorTransaction: null,

  // History
  history: {
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
  },
  loadingHistory: false,
  errorHistory: null,

  // Temp Transactions
  tempTransactions: [],
  loadingTemp: false,
  errorTemp: null,
  validating: null,
  validateError: null,

  // Dashboard
  dashboard: null,
  loadingDashboard: false,
  errorDashboard: null,
}

export default function posReducer(state = initialState, action) {
  switch (action.type) {
    // Events
    case GET_EVENTS_REQUEST:
      return { ...state, loadingEvents: true, errorEvents: null }
    case GET_EVENTS_SUCCESS:
      return { ...state, loadingEvents: false, events: action.payload, errorEvents: null }
    case GET_EVENTS_FAILURE:
      return { ...state, loadingEvents: false, errorEvents: action.payload, events: [] }

    // Categories
    case GET_CATEGORIES_REQUEST:
      return { ...state, loadingCategories: true, errorCategories: null }
    case GET_CATEGORIES_SUCCESS:
      return { ...state, loadingCategories: false, categories: action.payload, errorCategories: null }
    case GET_CATEGORIES_FAILURE:
      return { ...state, loadingCategories: false, errorCategories: action.payload, categories: [] }

    // Transaction
    case CREATE_TRANSACTION_REQUEST:
      return { ...state, submitting: true, errorTransaction: null, transactionSuccess: null }
    case CREATE_TRANSACTION_SUCCESS:
      return { ...state, submitting: false, transactionSuccess: action.payload, errorTransaction: null }
    case CREATE_TRANSACTION_FAILURE:
      return { ...state, submitting: false, errorTransaction: action.payload, transactionSuccess: null }
    case CLEAR_TRANSACTION_SUCCESS:
      return { ...state, transactionSuccess: null }

    // History
    case GET_HISTORY_REQUEST:
      return { ...state, loadingHistory: true, errorHistory: null }
    case GET_HISTORY_SUCCESS:
      return { ...state, loadingHistory: false, history: action.payload, errorHistory: null }
    case GET_HISTORY_FAILURE:
      return { ...state, loadingHistory: false, errorHistory: action.payload, history: initialState.history }

    // Temp Transactions
    case GET_TEMP_TRANSACTIONS_REQUEST:
      return { ...state, loadingTemp: true, errorTemp: null }
    case GET_TEMP_TRANSACTIONS_SUCCESS:
      return { ...state, loadingTemp: false, tempTransactions: action.payload, errorTemp: null }
    case GET_TEMP_TRANSACTIONS_FAILURE:
      return { ...state, loadingTemp: false, errorTemp: action.payload, tempTransactions: [] }

    // Validate Temp
    case VALIDATE_TEMP_REQUEST:
      return { ...state, validating: action.payload, validateError: null }
    case VALIDATE_TEMP_SUCCESS:
      return { ...state, validating: null, validateError: null }
    case VALIDATE_TEMP_FAILURE:
      return { ...state, validating: null, validateError: action.payload }

    // Dashboard
    case GET_DASHBOARD_REQUEST:
      return { ...state, loadingDashboard: true, errorDashboard: null }
    case GET_DASHBOARD_SUCCESS:
      return { ...state, loadingDashboard: false, dashboard: action.payload, errorDashboard: null }
    case GET_DASHBOARD_FAILURE:
      return { ...state, loadingDashboard: false, errorDashboard: action.payload, dashboard: null }

    default:
      return state
  }
}
