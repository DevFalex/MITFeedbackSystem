import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Loader from './common/Loader';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import SubmitFeedback from './pages/SubmitFeedback';
import MyFeedback from './pages/MyFeedback';
import AllFeedback from './pages/AllFeedback';
import Dashboard from './pages/Dashboard/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import DefaultLayout from './layout/DefaultLayout';
import RespondFeedback from './pages/RespondFeedback';
import AssignFeedback from './pages/AssignFeedback';
import UpdateStatus from './pages/UpdateStatus';
import MyAssignedFeedback from './pages/MyAssignedFeedback';

// Temporary placeholder for other pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="mt-2">This page is under development.</p>
  </div>
);

function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      {loading ? (
        <Loader />
      ) : (
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />

          {/* Protected routes with DefaultLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DefaultLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/submit-feedback" element={<SubmitFeedback />} />
              <Route path="/myfeeds" element={<MyFeedback />} />
              <Route path="/all-feedback" element={<AllFeedback />} />
              <Route
                path="/assigned-feedback"
                element={<MyAssignedFeedback />}
              />
              <Route path="/assign-feedback" element={<AssignFeedback />} />
              <Route path="/respond-feedback" element={<RespondFeedback />} />
              <Route
                path="/feedback/update-status"
                element={<UpdateStatus />}
              />
              <Route
                path="/user-management"
                element={<Placeholder title="User Management" />}
              />
              <Route
                path="/reports"
                element={<Placeholder title="Reports & Analytics" />}
              />
              <Route
                path="/audit"
                element={<Placeholder title="Audit Trail" />}
              />
              <Route
                path="/notifications"
                element={<Placeholder title="Notifications" />}
              />
              <Route
                path="/profile"
                element={<Placeholder title="Profile" />}
              />
              <Route
                path="/help"
                element={<Placeholder title="Help / FAQ" />}
              />
              <Route
                path="/settings"
                element={<Placeholder title="Settings" />}
              />
              <Route path="/logout" element={<Placeholder title="Logout" />} />
            </Route>
          </Route>
        </Routes>
      )}
    </AuthProvider>
  );
}

export default App;
