import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EcoTrackProvider } from './context/EcoTrackContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import TravelTracker from './pages/TravelTracker';
import Challenges from './pages/Challenges';
import EducationalHub from './pages/EducationalHub';
import Reports from './pages/Reports';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <AuthProvider>
        <EcoTrackProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/calculator" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Calculator />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/travel-tracker" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <TravelTracker />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/challenges" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Challenges />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/education" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <EducationalHub />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout>
                    <AdminPanel />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </EcoTrackProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
