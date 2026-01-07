import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardHome from './pages/dashboard/Home';
import NewTest from './pages/dashboard/NewTest';
import Staff from './pages/dashboard/Staff';
import Reports from './pages/dashboard/Reports';
import Certificate from './pages/Certificate';
import Verification from './pages/Verification';
import About from './pages/About';
import Contact from './pages/Contact';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/verify" element={<Verification />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/certificate/:id" element={<Certificate />} />

          {/* Protected Admin/Staff Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="new-test" element={<NewTest />} />
            <Route path="reports" element={<Reports />} />
            <Route path="staff" element={<Staff />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
