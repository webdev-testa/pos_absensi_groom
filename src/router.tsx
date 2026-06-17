import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import Dashboard from "@/pages/admin/Dashboard";
import ManageEmployee from "@/pages/admin/manageEmployee";
import Kasbon from "@/pages/admin/manageKasbon";
import Payroll from "@/pages/admin/managePayroll";
import AbsenEmployee from "@/pages/admin/absenEmployee";
import LoginPage from "@/pages/login/loginPage";

// Auth

function AuthLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

function AuthGuard() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center font-mono text-sm text-neutral-500">
        Authenticating...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function RoleGuard({ allowedRoles }: { allowedRoles: string[] }) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center font-mono text-sm text-[#8ABAC8]">
        Checking permissions...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin" || user.role === "superadmin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === "employee") {
      return (
        <div className="flex flex-col h-screen items-center justify-center font-mono text-sm bg-[#F5F2ED] text-[#1A1814] p-6 text-center">
          <div className="text-[#C84B2F] mb-4 text-base font-bold font-['Syne']">
            Akses Terbatas
          </div>
          <div className="text-[#6B6760] mb-6 max-w-xs leading-relaxed">
            Akun karyawan hanya dapat digunakan untuk melakukan absensi melalui aplikasi mobile native (Capacitor).
          </div>
          <button onClick={() => logout()} className="px-5 py-2.5 bg-[#1A1814] hover:bg-[#33302C] text-white rounded-[10px] font-sans font-medium transition-colors cursor-pointer">
            Log out
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col h-screen items-center justify-center font-mono text-sm">
          <div className="text-[#F5A940] mb-2">
            Error: Invalid or missing user role ({user.role || "none"}).
          </div>
          <button onClick={() => logout()} className="text-blue-500 underline">
            Log out
          </button>
        </div>
      );
    }
  }

  return <Outlet />;
}

// Route

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        element: <AuthGuard />,
        children: [
          {
            element: <RoleGuard allowedRoles={["admin", "superadmin"]} />,
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
            ],
          },
        ],
      },
    ],
  },
]);
