import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';

// Route-level lazy loading keeps the initial login bundle small.
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/student/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const FolderViewerPage = lazy(() => import('./pages/student/FolderViewerPage').then((module) => ({ default: module.FolderViewerPage })));
const PdfViewerPage = lazy(() => import('./pages/student/PdfViewerPage').then((module) => ({ default: module.PdfViewerPage })));
const QuizPage = lazy(() => import('./pages/student/QuizPage').then((module) => ({ default: module.QuizPage })));
const UnitQuizSelectPage = lazy(() => import('./pages/student/UnitQuizSelectPage').then((module) => ({ default: module.UnitQuizSelectPage })));
const SuggestMaterialPage = lazy(() => import('./pages/student/SuggestMaterialPage').then((module) => ({ default: module.SuggestMaterialPage })));
const AnalyticsPage = lazy(() => import('./pages/student/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })));
const PaymentPage = lazy(() => import('./pages/student/PaymentPage').then((module) => ({ default: module.PaymentPage })));
const ProfilePage = lazy(() => import('./pages/student/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })));

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
        <Suspense fallback={
          <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
            <div className="flex items-center gap-3" role="status" aria-live="polite">
              <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              <span>Loading page…</span>
            </div>
          </div>
        }>
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
