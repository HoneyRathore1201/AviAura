import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AiChatbot from './components/AiChatbot'
import Landing from './pages/Landing'
import PlanTrip from './pages/PlanTrip'
import Itinerary from './pages/Itinerary'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Support from './pages/Support'
import Explore from './pages/Explore'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="relative min-h-screen">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/plan" element={<PlanTrip />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/about" element={<About />} />
              <Route path="/support" element={<Support />} />
              <Route path="/itinerary" element={<Itinerary />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <AiChatbot />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
