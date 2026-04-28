import './index.css'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { RoleGuard } from '@/components/auth/RoleGuard'
import Dashboard from '@/pages/admin/Dashboard'
import ManageEmployee from '@/pages/admin/manageEmployee'
import Kasbon from '@/pages/admin/manageKasbon'
import Payroll from '@/pages/admin/managePayroll'
import AbsenEmployee from '@/pages/admin/absenEmployee'
import LoginPage from '@/pages/admin/loginPage'
import EmployeeHome from '@/pages/employee/Home'

const queryClient = new QueryClient()
const router = createBrowserRouter([
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
        element: <RoleGuard allowedRoles={['admin', 'superadmin']} fallbackPath="/employee/home" />,
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
        element: <RoleGuard allowedRoles={['employee']} fallbackPath="/admin/dashboard" />,
        children: [
          {
            path: "/employee/home",
            element: <EmployeeHome />,
          }
        ]
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <Toaster />
  </QueryClientProvider>
)