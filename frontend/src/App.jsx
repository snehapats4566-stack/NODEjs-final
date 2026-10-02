import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PetDetail from './pages/PetDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import AddPet from './pages/AddPet';
import MyRequests from './pages/MyRequests';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pets/:id" element={<PetDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-pet"
            element={
              <ProtectedRoute adminOnly>
                <AddPet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-pet/:id"
            element={
              <ProtectedRoute adminOnly>
                <AddPet />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a35',
              color: '#f1f5f9',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '12px',
              fontSize: '0.9rem',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
