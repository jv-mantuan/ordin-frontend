import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/shared/Sidebar'
import { DashboardPage } from './pages/Dashboard'
import { TransactionsPage } from './pages/Transactions'
import { colors } from './theme'
import { CategoriesPage } from './pages/Categories'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', height: '100vh', background: colors.bgApp, overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transacoes" element={<TransactionsPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/receitas" element={<TransactionsPage />} />
            <Route path="/configuracoes" element={<PlaceholderPage title="Configurações" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
      {title} — em breve
    </div>
  )
}
