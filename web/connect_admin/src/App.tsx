import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import VerificationQueue from './pages/VerificationQueue';
import { Dashboard } from './pages/Dashboard';
import { GuidesConsole } from './pages/GuidesConsole';
import { ToursConsole } from './pages/ToursConsole';
import { BookingsConsole } from './pages/BookingsConsole';
import { ReviewsConsole } from './pages/ReviewsConsole';
import { ReportsConsole } from './pages/ReportsConsole';
import { Settings } from './pages/Settings';
import { useAuthStore } from './stores/authStore';

const requireAuth = (element: React.ReactElement) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={requireAuth(<Dashboard />)}
      />
      <Route
        path="/verifications"
        element={requireAuth(<VerificationQueue />)}
      />
      <Route path="/verification" element={<Navigate to="/verifications" replace />} />
      <Route
        path="/guides"
        element={requireAuth(<GuidesConsole />)}
      />
      <Route
        path="/tours"
        element={requireAuth(<ToursConsole />)}
      />
      <Route
        path="/bookings"
        element={requireAuth(<BookingsConsole />)}
      />
      <Route
        path="/reviews"
        element={requireAuth(<ReviewsConsole />)}
      />
      <Route
        path="/reports"
        element={requireAuth(<ReportsConsole />)}
      />
      <Route
        path="/settings"
        element={requireAuth(<Settings />)}
      />
      {/* Fallback to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
