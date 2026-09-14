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
import GroomingDashboard from "@/pages/grooming/GroomingDashboard";
import GroomingCheckIn from "@/pages/grooming/GroomingCheckIn";
import GroomingPengaturan from "@/pages/grooming/GroomingPengaturan";
import GroomerWorkstation from "@/pages/grooming/GroomerWorkstation";
import GroomingReport from "@/pages/grooming/GroomingReport";
import { Link } from "react-router-dom";

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
    if (user.role === "superadmin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === "admin") {
      return <Navigate to="/admin/pos" replace />;
    } else if (user.role === "employee") {
      return (
        <div className="flex flex-col h-screen items-center justify-center font-mono text-sm bg-background text-foreground p-6 text-center">
          <div className="text-destructive mb-3 text-base font-bold font-heading">
            Akses Terbatas
          </div>
          <div className="text-muted-foreground mb-6 max-w-xs leading-relaxed font-sans text-xs">
            Akun karyawan dapat digunakan untuk absensi mobile atau mengoperasikan Workstation Grooming salon.
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              to="/groomer"
              className="min-h-[44px] px-5 py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl font-sans text-xs font-semibold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              ✂️ Buka Workstation Grooming
            </Link>
            <button
              onClick={() => logout()}
              className="min-h-[44px] px-5 py-2.5 bg-surface-soft hover:bg-surface-muted text-foreground border border-border rounded-xl font-sans text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              Log out
            </button>
          </div>
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
      // ── PUBLIC LIVE REPORT ROUTE (Customer — No Login Required) ──
      {
        path: "/grooming/report/:token",
        element: <GroomingReport />,
      },
      {
        element: <AuthGuard />,
        children: [
          // ── GROOMER MOBILE WORKSTATION (All Authenticated Staff) ──
          {
            element: <RoleGuard allowedRoles={["superadmin", "admin", "employee"]} />,
            children: [
              {
                path: "/groomer",
                element: <GroomerWorkstation />,
              },
            ],
          },
          {
            // HR routes — superadmin only
            element: <RoleGuard allowedRoles={["superadmin"]} />,
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
          {
            // POS routes — superadmin + admin (POS staff)
            element: <RoleGuard allowedRoles={["superadmin", "admin"]} />,
            children: [
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
              // ── GROOMING ADMIN MODULE ──
              {
                path: "/admin/grooming",
                element: <GroomingDashboard />,
              },
              {
                path: "/admin/grooming/new",
                element: <GroomingCheckIn />,
              },
              {
                path: "/admin/grooming/pengaturan",
                element: <GroomingPengaturan />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
