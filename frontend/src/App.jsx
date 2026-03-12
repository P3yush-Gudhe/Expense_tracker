import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import InstallPrompt from './components/InstallPrompt';
import AuthPage from './views/AuthPage';
import Dashboard from './views/Dashboard';
import Expenses from './views/Expenses';
import Analytics from './views/Analytics';
import Budget from './views/Budget';

function PrivateLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {/* PWA install prompt — shown when browser supports it */}
      <InstallPrompt />
    </div>
  );
}

function AuthLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-center"><div className="spinner" /></div>;
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthLayout />} />
            <Route path="/*" element={<PrivateLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
