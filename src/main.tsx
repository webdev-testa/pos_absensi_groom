import './index.css'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthGuard } from '@/components/auth/AuthGuard'
import ManageEmployee from '@/pages/admin/manageEmployee'
import AdminDashboard from '@/pages/admin/Dashboard'
import LoginPage from '@/pages/admin/loginPage'

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
        path: "/admin/dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "/admin/karyawan",
        element: <ManageEmployee />,
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