import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/shared/Sidebar'
import { BottomNav } from './components/shared/BottomNav'
import { DashboardPage } from './pages/Dashboard'
import { TransactionsPage } from './pages/Transactions'
import { CategoriesPage } from './pages/Categories'
import { ThemeProvider } from './context/ThemeProvider'
import { useTheme } from './context/ThemeContext'
import { useBreakpoint } from './hooks/useBreakpoint'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}

function AppShell() {
  const { colors } = useTheme()
  const { isMobile } = useBreakpoint()

  return (
    <BrowserRouter>
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
          // Offset above BottomNav on mobile
          marginBottom: isMobile ? '64px' : '0',
        }}
      />
    </BrowserRouter>
  )
}