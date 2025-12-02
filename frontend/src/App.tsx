import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import RegistrationFlow from './pages/RegistrationFlow';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Results from './pages/Results';
import Balance from './pages/Balance';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Circulars from './pages/Circulars';
import ApplyConfirmation from './pages/ApplyConfirmation';
import AgentCheckout from './pages/AgentCheckout';
import NotFound from './pages/NotFound';
import CallForAdmission from './pages/CallForAdmission'; // This is already correctly imported

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ======================= */}
        {/*     Public Routes     */}
        {/* ======================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegistrationFlow />} />

        {/* ======================= */}
        {/*    Protected Routes   */}
        {/* ======================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          }
        />
        {/* --- This route is now protected --- */}
        <Route
          path="/call-for-admission"
          element={
            <ProtectedRoute>
              <CallForAdmission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/balance"
          element={
            <ProtectedRoute>
              <Balance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circulars"
          element={
            <ProtectedRoute>
              <Circulars />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply"
          element={
            <ProtectedRoute>
              <ApplyConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <AgentCheckout />
            </ProtectedRoute>
          }
        />

        {/* ======================= */}
        {/*      404 Not Found    */}
        {/* ======================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
