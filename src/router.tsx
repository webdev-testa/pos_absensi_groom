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
import PosDashboard from "@/pages/pos/PosDashboard";
import CheckIn from "@/pages/pos/CheckIn";
import LaporanHarian from "@/pages/pos/LaporanHarian";
import CheckOut from "@/pages/pos/CheckOut";
import KucingDetail from "@/pages/pos/KucingDetail";
import Pengaturan from "@/pages/pos/Pengaturan";

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
      <div className="flex h-screen items-center justify-center font-mono text-sm text-muted-foreground bg-background">
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
        <div className="flex flex-col h-screen items-center justify-center font-mono text-sm bg-background text-foreground p-6 text-center">
          <div className="text-destructive mb-4 text-base font-bold font-heading">
            Akses Terbatas
          </div>
          <div className="text-muted-foreground mb-6 max-w-xs leading-relaxed font-sans text-xs">
            Akun karyawan hanya dapat digunakan untuk melakukan absensi melalui aplikasi mobile native (Capacitor).
          </div>
          <button onClick={() => logout()} className="min-h-[44px] px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-sans text-xs font-semibold transition-all cursor-pointer shadow-xs">
            Log out
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col h-screen items-center justify-center font-mono text-sm bg-background text-foreground p-6">
          <div className="text-amber-600 dark:text-amber-400 mb-2 font-semibold">
            Error: Invalid or missing user role ({user.role || "none"}).
          </div>
          <button onClick={() => logout()} className="text-primary underline font-sans text-xs mt-2 cursor-pointer">
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
              {
                path: "/admin/pos",
                element: <PosDashboard />,
              },
              {
                path: "/admin/pos/check-in",
                element: <CheckIn />,
              },
              {
                path: "/admin/pos/laporan",
                element: <LaporanHarian />,
              },
              {
                path: "/admin/pos/check-out",
                element: <CheckOut />,
              },
              {
                path: "/admin/pos/kucing/:bookingId",
                element: <KucingDetail />,
              },
              {
                path: "/admin/pos/pengaturan",
                element: <Pengaturan />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
