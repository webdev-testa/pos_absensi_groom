import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, AuthProvider } from '@/hooks/useAuth'
import Dashboard from '@/pages/admin/Dashboard'
import ManageEmployee from '@/pages/admin/manageEmployee'
import Kasbon from '@/pages/admin/manageKasbon'
import Payroll from '@/pages/admin/managePayroll'
import AbsenEmployee from '@/pages/admin/absenEmployee'
import LoginPage from '@/pages/login/loginPage'
import EmployeeHome from '@/pages/employee/Home'

// Auth

function AuthLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

function AuthGuard() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex h-screen items-center justify-center font-mono text-sm text-neutral-500">Authenticating...</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

function RoleGuard({ allowedRoles }: { allowedRoles: string[] }) {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return <div className="flex h-screen items-center justify-center font-mono text-sm text-[#A8A49E]">Checking permissions...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin' || user.role === 'superadmin') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (user.role === 'employee') {
      return <Navigate to="/employee/home" replace />
    } else {
      return (
        <div className="flex flex-col h-screen items-center justify-center font-mono text-sm">
          <div className="text-[#C84B2F] mb-2">Error: Invalid or missing user role ({user.role || 'none'}).</div>
          <button 
            onClick={() => logout()} 
            className="text-blue-500 underline"
          >
            Log out
          </button>
        </div>
      )
    }
  }

  return <Outlet />
}

// Route

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        element: <AuthGuard />,
        children: [
          {
            element: <RoleGuard allowedRoles={['admin', 'superadmin']} />,
            children: [
              {
                path: "/admin/dashboard",
                element: <Dashboard />,
              },
              {
                path: "/admin/absensi",
                element: <AbsenEmployee />,
              },
              {
                path: "/admin/kasbon",
                element: <Kasbon />,
              },
              {
                path: "/admin/payroll",
                element: <Payroll />,
              },
              {
                path: "/admin/karyawan",
                element: <ManageEmployee />,
              },
            ]
          },
          {
            element: <RoleGuard allowedRoles={['employee']} />,
            children: [
              {
                path: "/employee/home",
                element: <EmployeeHome />,
              }
            ]
          }
        ]
      }
    ]
  }
])
