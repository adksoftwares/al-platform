import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/student/DashboardPage';
import { FolderViewerPage } from './pages/student/FolderViewerPage';
import { PdfViewerPage } from './pages/student/PdfViewerPage';
import { QuizPage } from './pages/student/QuizPage';
import { UnitQuizSelectPage } from './pages/student/UnitQuizSelectPage';
import { SuggestMaterialPage } from './pages/student/SuggestMaterialPage';
import { AnalyticsPage } from './pages/student/AnalyticsPage';
import { PaymentPage } from './pages/student/PaymentPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Protected Student Shell
const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-600 selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-10">
        {children}
      </main>
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

// Protected Admin Route
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-600 selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-10">
        {children}
      </main>
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

// Public Route (redirects if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <StudentLayout>
                <DashboardPage />
              </StudentLayout>
            }
          />
          <Route
            path="/folder/:subjectName"
            element={
              <StudentLayout>
                <FolderViewerPage />
              </StudentLayout>
            }
          />
          <Route
            path="/pdf-viewer/:subjectName/:folderName"
            element={
              <StudentLayout>
                <PdfViewerPage />
              </StudentLayout>
            }
          />
          <Route
            path="/quiz/:subjectName"
            element={
              <StudentLayout>
                <QuizPage />
              </StudentLayout>
            }
          />
          <Route
            path="/quiz-units/:subjectName"
            element={
              <StudentLayout>
                <UnitQuizSelectPage />
              </StudentLayout>
            }
          />
          <Route
            path="/suggest-material"
            element={
              <StudentLayout>
                <SuggestMaterialPage />
              </StudentLayout>
            }
          />
          <Route
            path="/analytics"
            element={
              <StudentLayout>
                <AnalyticsPage />
              </StudentLayout>
            }
          />
          <Route
            path="/payment"
            element={
              <StudentLayout>
                <PaymentPage />
              </StudentLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <StudentLayout>
                <ProfilePage />
              </StudentLayout>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
