import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import AccountPage from "./pages/AccountPage";
import DogsPage from "./pages/DogsPage";
import DeliveriesPage from "./pages/DeliveriesPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SettingsPage from "./pages/SettingsPage";
import CheckoutPage from "./pages/CheckoutPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { person, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  if (!person) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { person, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;

  return (
    <Routes>
      <Route path="/login" element={person ? <Navigate to="/account" replace /> : <LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/account" replace />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="dogs" element={<DogsPage />} />
        <Route path="deliveries" element={<DeliveriesPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/account" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
