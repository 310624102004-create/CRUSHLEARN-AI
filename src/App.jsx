import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthService } from './utils/auth';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Course from './pages/Course';
import Lesson from './pages/Lesson';
import SkillPassport from './pages/SkillPassport';
import Certificate from './pages/Certificate';
import Profile from './pages/Profile';

function App() {
  const isAuthenticated = AuthService.isAuthenticated();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
            }
          />
          <Route
            path="/forgot-password"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
            }
          />

          {/* Protected Routes - Main App Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <div className="flex flex-1 pt-16">
                    <Sidebar />
                    <main className="flex-1 md:ml-64">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/course/:courseId" element={<Course />} />
                        <Route
                          path="/course/:courseId/lesson/:lessonId"
                          element={<Lesson />}
                        />
                        <Route path="/skill-passport" element={<SkillPassport />} />
                        <Route
                          path="/certificate/:certificateId"
                          element={<Certificate />}
                        />
                        <Route path="/profile" element={<Profile />} />
                        
                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
