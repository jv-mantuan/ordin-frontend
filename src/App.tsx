import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/shared/Sidebar'
import { BottomNav } from './components/shared/BottomNav'
import { DashboardPage } from './pages/Dashboard'
import { TransactionsPage } from './pages/Transactions'
import { CategoriesPage } from './pages/Categories'
import { LoginPage } from './pages/Login'
import { SignupPage } from './pages/Signup'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { ThemeProvider } from './context/ThemeProvider'
import { AuthProvider } from './context/AuthProvider'
import { useTheme } from './context/ThemeContext'
import { useBreakpoint } from './hooks/useBreakpoint'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toasts />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

function AppShell() {
  const { colors } = useTheme()
  const { isMobile } = useBreakpoint()

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        background: colors.bgApp,
        overflow: 'hidden',
      }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transacoes" element={<TransactionsPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
          </Routes>
        </div>
      </div>

      {isMobile && <BottomNav />}
    </>
  )
}

function Toasts() {
  const { colors } = useTheme()
  const { isMobile } = useBreakpoint()
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      theme="dark"
      toastStyle={{
        background: colors.bgCard,
        color: colors.textPrimary,
        border: `1px solid ${colors.border}`,
        marginBottom: isMobile ? '64px' : '0',
      }}
    />
  )
}
