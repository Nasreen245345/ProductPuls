import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './store/ThemeContext'
import { AuthProvider } from './store/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
