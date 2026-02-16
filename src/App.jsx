import { useEffect, useMemo } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Login from './pages/LoginPage'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import PendingPage from './pages/PendingPage'
import GrafikPage from './pages/GrafikPage'
import MposLayout from './components/MposLayout'
import { getMe } from './redux/actions/authActions'
import { getToken } from './utils/api'

function App() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const isAuth = !!getToken()

  useEffect(() => {
    if (getToken() && !user) {
      dispatch(getMe())
    }
  }, [dispatch, user])

  const layoutElement = useMemo(
    () => (isAuth ? <MposLayout /> : <Navigate to="/" replace />),
    [isAuth]
  )

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={layoutElement}
        >
          <Route index element={<HomePage />} />
          <Route path="pending" element={<PendingPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="grafik" element={<GrafikPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
