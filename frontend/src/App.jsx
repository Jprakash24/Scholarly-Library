import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ProtectedRoute from './components/ui/ProtectedRoute'
import RouteNav from './components/layout/RouteNav'
import { ActivityProvider } from './contexts/ActivityContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { UserLibraryProvider } from './contexts/UserLibraryContext'
import ActionToast from './components/ui/ActionToast'
import AdminLayout from './components/layout/AdminLayout'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import DashboardPage from './pages/user/DashboardPage'
import ActivityPage from './pages/user/ActivityPage'
import ProfilePage from './pages/user/ProfilePage'
import CatalogPage from './pages/user/CatalogPage'
import MaterialDetailPage from './pages/user/MaterialDetailPage'
import MaterialViewerPage from './pages/user/MaterialViewerPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminUserFormPage from './pages/admin/AdminUserFormPage'
import AdminBorrowsPage from './pages/admin/AdminBorrowsPage'
import MaterialsPage from './pages/admin/MaterialsPage'
import MaterialsFilesPage from './pages/admin/MaterialsFilesPage'
import AddMaterialPage from './pages/admin/AddMaterialPage'
import UpdateMaterialPage from './pages/admin/UpdateMaterialPage'
import AdminSavedHistoryPage from './pages/admin/AdminSavedHistoryPage'
import AdminBorrowHistoryPage from './pages/admin/AdminBorrowHistoryPage'
import SaveHistoryPage from './pages/user/SaveHistoryPage'
import LandingPage from './pages/LandingPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppNav() {
  const { pathname } = useLocation()
  if (['/','','/login','/signup','/verify-email'].includes(pathname)) return null
  return (
    <div className="hidden md:block">
      <RouteNav />
    </div>
  )
}

function UserRouteWrapper({ children }) {
  const { role } = useAuth()
  const isAdmin = role === 'admin' || role === 'superadmin'
  if (isAdmin) return <AdminLayout>{children}</AdminLayout>
  return children
}

function AdminPageWrapper({ children }) {
  return <AdminLayout>{children}</AdminLayout>
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ThemeProvider>
        <ProfileProvider>
          <ActivityProvider>
          <UserLibraryProvider>
        <AppNav />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute>
                <UserRouteWrapper><DashboardPage /></UserRouteWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/activity"
            element={
              <ProtectedRoute>
                <UserRouteWrapper><ActivityPage /></UserRouteWrapper>
              </ProtectedRoute>
            }
          />
          {/* Redirect removed dashboard-files route */}
          <Route path="/user/dashboard-files" element={<Navigate to="/user/dashboard" replace />} />
          <Route
            path="/user/catalog"
            element={
              <ProtectedRoute>
                <UserRouteWrapper><CatalogPage /></UserRouteWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/materials/:id"
            element={
              <ProtectedRoute>
                <UserRouteWrapper><MaterialDetailPage /></UserRouteWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/materials/:id/view"
            element={
              <ProtectedRoute>
                <UserRouteWrapper><MaterialViewerPage /></UserRouteWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute>
                <UserRouteWrapper><ProfilePage /></UserRouteWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/save-history"
            element={
              <ProtectedRoute>
                <UserRouteWrapper><SaveHistoryPage /></UserRouteWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPageWrapper><AdminAnalyticsPage /></AdminPageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/borrows"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPageWrapper><AdminBorrowsPage /></AdminPageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPageWrapper><AdminUsersPage /></AdminPageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/new"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPageWrapper><AdminUserFormPage /></AdminPageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id/edit"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPageWrapper><AdminUserFormPage /></AdminPageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/materials"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPageWrapper><MaterialsPage /></AdminPageWrapper>
              </ProtectedRoute>
            }
          />
          {/* Redirect removed materials/actions route to main materials */}
          <Route path="/admin/materials/actions" element={<Navigate to="/admin/materials" replace />} />
          <Route
            path="/admin/materials/files"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPageWrapper><MaterialsFilesPage /></AdminPageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/materials/add"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPageWrapper><AddMaterialPage /></AdminPageWrapper>
              </ProtectedRoute>
            }
          />
          {/* Redirect removed add-files route to add */}
          <Route path="/admin/materials/add-files" element={<Navigate to="/admin/materials/add" replace />} />
          <Route
            path="/admin/borrow-history"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPageWrapper><AdminBorrowHistoryPage /></AdminPageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/saved-history"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPageWrapper><AdminSavedHistoryPage /></AdminPageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/materials/:id/edit"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPageWrapper><UpdateMaterialPage /></AdminPageWrapper>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ActionToast />
        </UserLibraryProvider>
          </ActivityProvider>
        </ProfileProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
