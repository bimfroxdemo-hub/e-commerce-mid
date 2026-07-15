import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Toaster } from 'react-hot-toast';

// Layout & Reusable
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import QuickViewModal from './components/QuickViewModal';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Login from './pages/Login';

function MainAppLayout() {
  // ==============================
  // State Management
  // ==============================
  const [currentPage, setCurrentPage] = useState('home');
  const [routeParams, setRouteParams] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { isAuthenticated, currentUser, isLoading } = useApp();

  // ==============================
  // Helpers
  // ==============================
  const getNormalizedRole = (user) => {
    return String(user?.role || '').trim().toLowerCase();
  };

  const isAdminUser = (user) => {
    const role = getNormalizedRole(user);

    return (
      role === 'admin' ||
      role === 'superadmin' ||
      role === 'super-admin' ||
      user?.isAdmin === true
    );
  };

  // ==============================
  // Navigation Handler
  // ==============================
  const handleNavigate = (page, params = null) => {
    console.log('🔄 Navigating to:', page, params);

    if (page === 'admin-dashboard') {
      console.log('🔍 Admin Access Check:', {
        isAuthenticated,
        currentUser,
        userRole: currentUser?.role,
        normalizedRole: getNormalizedRole(currentUser),
        canAccessAdmin: isAuthenticated && isAdminUser(currentUser),
      });
    }

    // Close quick view when navigating
    setQuickViewProduct(null);

    setCurrentPage(page);
    setRouteParams(params);

    // Smooth scroll to top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // ==============================
  // Enhanced Admin Access Check
  // ==============================
  const canAccessAdmin = () => {
    const hasAuth = isAuthenticated && currentUser;
    const isAdmin = isAdminUser(currentUser);

    console.log('🛡️ Admin Access Validation:', {
      isAuthenticated,
      hasCurrentUser: !!currentUser,
      userRole: currentUser?.role,
      normalizedRole: getNormalizedRole(currentUser),
      isAdminRole: isAdmin,
      finalResult: Boolean(hasAuth && isAdmin),
    });

    return Boolean(hasAuth && isAdmin);
  };

  // ==============================
  // Loading State Handler
  // ==============================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ==============================
  // Render Page Based on State
  // ==============================
  const renderPage = () => {
    try {
      switch (currentPage) {
        case 'home':
          return (
            <Home
              onNavigate={handleNavigate}
              onQuickView={setQuickViewProduct}
            />
          );

        case 'shop':
          return (
            <Shop
              onNavigate={handleNavigate}
              onQuickView={setQuickViewProduct}
              routeParams={routeParams}
            />
          );

        case 'product-details':
          return (
            <ProductDetails
              routeParams={routeParams}
              onNavigate={handleNavigate}
              onQuickView={setQuickViewProduct}
            />
          );

        case 'wishlist':
          return <Wishlist onNavigate={handleNavigate} />;

        case 'cart':
          return <Cart onNavigate={handleNavigate} />;

        case 'checkout':
          return (
            <Checkout
              onNavigate={handleNavigate}
              routeParams={routeParams}
            />
          );

        case 'user-dashboard':
        case 'user-orders':
        case 'user-settings':
          return isAuthenticated ? (
            <UserDashboard
              onNavigate={handleNavigate}
              routeParams={routeParams}
            />
          ) : (
            <Login onNavigate={handleNavigate} />
          );

        case 'admin-dashboard':
          if (!isAuthenticated) {
            console.warn('⚠️ Admin access denied: Not authenticated');
            return <Login onNavigate={handleNavigate} />;
          }

          if (!currentUser) {
            console.warn('⚠️ Admin access denied: No user data');
            return <Login onNavigate={handleNavigate} />;
          }

          if (!canAccessAdmin()) {
            console.warn('⚠️ Admin access denied: User role is', currentUser?.role);

            return (
              <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🚫</span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Access Denied
                  </h2>

                  <p className="text-sm text-gray-600 mb-6">
                    You don't have administrator privileges to access this area.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => handleNavigate('home')}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Go to Home
                    </button>

                    <button
                      onClick={() => handleNavigate('login')}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Login as Admin
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          console.log('✅ Admin access granted');

          return <AdminDashboard onNavigate={handleNavigate} />;

        case 'about':
          return <About onNavigate={handleNavigate} />;

        case 'contact':
          return <Contact onNavigate={handleNavigate} />;

        case 'faq':
          return <FAQ onNavigate={handleNavigate} />;

        case 'privacy':
          return <PrivacyPolicy onNavigate={handleNavigate} />;

        case 'terms':
          return <Terms onNavigate={handleNavigate} />;

        case 'login':
          return <Login onNavigate={handleNavigate} />;

        case 'register':
          return <Login onNavigate={handleNavigate} mode="register" />;

        case 'forgot-password':
          return <Login onNavigate={handleNavigate} mode="forgot-password" />;

        default:
          console.warn('⚠️ Unknown page:', currentPage);

          return (
            <Home
              onNavigate={handleNavigate}
              onQuickView={setQuickViewProduct}
            />
          );
      }
    } catch (error) {
      console.error('❌ Page render error:', error);

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Something went wrong
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              We encountered an error while loading this page. Please try again.
            </p>

            <button
              onClick={() => handleNavigate('home')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white font-sans antialiased text-gray-800">
      {/* ============================== */}
      {/* Dynamic Header/Navbar */}
      {/* ============================== */}
      <Navbar
        onNavigate={handleNavigate}
        currentPage={currentPage}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
      />

      {/* ============================== */}
      {/* Main Viewport Content */}
      {/* ============================== */}
      <main className="flex-1">{renderPage()}</main>

      {/* ============================== */}
      {/* Premium Footer */}
      {/* ============================== */}
      <Footer onNavigate={handleNavigate} />

      {/* ============================== */}
      {/* Global Quick View Overlay Modal */}
      {/* ============================== */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onNavigate={handleNavigate}
        />
      )}

      {/* ============================== */}
      {/* Hot Toast Notification Config */}
      {/* ============================== */}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}