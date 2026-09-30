import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import { UserProvider } from './context/UserContext'
import LoadingWrapper from './components/LoadingWrapper'
import GoogleAuthGuard from './components/GoogleAuthGuard'
import WelcomeScreen from './pages/WelcomeScreen'
import OnboardingFlow from './pages/OnboardingFlow'
import Dashboard from './pages/Dashboard'
import Legal from './pages/Legal'
import LegalDoc from './pages/LegalDoc'

// Redirect to /welcome but keep the query string, so ?utm_source=… from a shared link stays
// visible and readable after landing (e.g. prime-daily-app.web.app/?utm_source=tiktok).
function ToWelcome() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: '/welcome', search }} replace />
}

export default function App() {
  return (
    <LangProvider>
    <AuthProvider>
    <UserProvider>
      <BrowserRouter>
        <LoadingWrapper>
          <Routes>
            <Route path="/"          element={<ToWelcome />} />
            <Route path="/welcome"   element={<WelcomeScreen />} />
            <Route path="/setup"     element={<GoogleAuthGuard><OnboardingFlow /></GoogleAuthGuard>} />
            <Route path="/dashboard" element={<GoogleAuthGuard><Dashboard /></GoogleAuthGuard>} />
            <Route path="/legal"     element={<Legal />} />
            <Route path="/privacy"   element={<LegalDoc type="privacy" />} />
            <Route path="/terms"     element={<LegalDoc type="terms" />} />
            <Route path="*"          element={<ToWelcome />} />
          </Routes>
        </LoadingWrapper>
      </BrowserRouter>
    </UserProvider>
    </AuthProvider>
    </LangProvider>
  )
}
