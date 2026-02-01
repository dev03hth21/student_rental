import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import AdminDashboardSummary from './pages/AdminDashboardSummary';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminProfilePage from './pages/AdminProfilePage';
import PendingRoomsPage from './pages/PendingRoomsPage';
import ApprovedRoomsPage from './pages/ApprovedRoomsPage';
import RejectedRoomsPage from './pages/RejectedRoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import ReportsPage from './pages/ReportsPage';

function RequireAuth({ children }) {
  const token = localStorage.getItem('admin_token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}

export default function App() {
  const token = localStorage.getItem('admin_token');

  return (
    <div className="app-shell">
      {token && <NavBar />}
      <main className="page">
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard/summary" replace /> : <LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Navigate to="/dashboard/summary" replace />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/summary"
            element={
              <RequireAuth>
                <AdminDashboardSummary />
              </RequireAuth>
            }
          />
          <Route
            path="/users"
            element={
              <RequireAuth>
                <AdminUsersPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <AdminProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/rooms/pending"
            element={
              <RequireAuth>
                <PendingRoomsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/rooms/:roomId"
            element={
              <RequireAuth>
                <RoomDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/rooms/approved"
            element={
              <RequireAuth>
                <ApprovedRoomsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/rooms/rejected"
            element={
              <RequireAuth>
                <RejectedRoomsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireAuth>
                <ReportsPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
