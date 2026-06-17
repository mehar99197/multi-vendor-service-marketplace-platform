import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/layout/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import CustomerDashboard from './pages/CustomerDashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import CreateService from './pages/CreateService'
import EditService from './pages/EditService'
import SubmitRequest from './pages/SubmitRequest'
import ProjectTracking from './pages/ProjectTracking'
import MyRequests from './pages/MyRequests'
import ReceivedRequests from './pages/ReceivedRequests'

function DashboardRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const roleRoutes = {
    customer: '/dashboard/customer',
    provider: '/dashboard/provider',
    admin: '/dashboard/admin',
  }
  return <Navigate to={roleRoutes[user.role] || '/dashboard/customer'} replace />
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/services/create" element={
              <ProtectedRoute roles={['provider', 'admin']}>
                <CreateService />
              </ProtectedRoute>
            } />
            <Route path="/services/edit/:id" element={
              <ProtectedRoute roles={['provider', 'admin']}>
                <EditService />
              </ProtectedRoute>
            } />
            <Route path="/services/:id/request" element={
              <ProtectedRoute roles={['customer']}>
                <SubmitRequest />
              </ProtectedRoute>
            } />
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <ProjectTracking />
              </ProtectedRoute>
            } />
            <Route path="/my-requests" element={
              <ProtectedRoute roles={['customer']}>
                <MyRequests />
              </ProtectedRoute>
            } />
            <Route path="/received-requests" element={
              <ProtectedRoute roles={['provider']}>
                <ReceivedRequests />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/customer" element={
              <ProtectedRoute roles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/provider" element={
              <ProtectedRoute roles={['provider']}>
                <ProviderDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
