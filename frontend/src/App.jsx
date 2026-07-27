import React, { useState, useEffect } from 'react';
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

// NEW PAGES FOR SELLER Central
import SellerLanding from './pages/SellerLanding';
import SellerRegister from './pages/SellerRegister';
import SellerDashboard from './pages/SellerDashboard';

function MainAppLayout() {
  // ==============================
  // State Management
  // ==============================
  const [currentPage, setCurrentPage] = useState('home');
  const [routeParams, setRouteParams] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { isAuthenticated, currentUser, isLoading, categories = [] } = useApp();

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
  // Dynamic Seller Onboarding Guard
  // ==============================
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const role = getNormalizedRole(currentUser);
      if (role === 'seller') {
        const onboarded = !!currentUser.storeName;
        localStorage.setItem('isSellerOnboarded', onboarded ? 'true' : 'false');

        // Prevent unauthorized redirection to dashboard on step-by-step registration
        if (currentPage === 'login' || currentPage === 'register') {
          if (onboarded) {
            handleNavigate('seller-dashboard');
          } else {
            handleNavigate('seller-onboarding');
          }
        }

        // Active Guard: If they try to load dashboard without a registered store name
        if (currentPage === 'seller-dashboard' && !onboarded) {
          console.warn('⚠️ Onboarding incomplete. Redirecting back to onboarding wizard.');
          handleNavigate('seller-onboarding');
        }
      }
    }
  }, [isAuthenticated, currentUser, currentPage]);

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

    setQuickViewProduct(null);
    setCurrentPage(page);
    setRouteParams(params);

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

  // HIDES NAV/FOOTER ON REGISTER FLOWS & WORKSPACE PANELS 
  const isSellerPortal = ['seller-onboarding', 'seller-dashboard'].includes(currentPage);

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

        case 'collections':
          const displayCategories = categories.filter(
            (cat) => 
              cat.slug?.toLowerCase() !== 'home' && 
              cat.name?.toLowerCase() !== 'home' &&
              cat.slug?.toLowerCase() !== 'home-page' &&
              cat.slug !== '/' &&
              cat.name?.toLowerCase() !== 'collections'
          );

          return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1A1A3A] mb-3">
                    Our Collections
                  </h1>
                  <div className="w-12 h-[2px] bg-[#D4AF37] mx-auto mb-4" />
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Explore our curated seasonal edits and hand-crafted boutique collections.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayCategories.map((cat) => (
                    <div
                      key={cat.id || cat._id}
                      onClick={() => handleNavigate('shop', { category: cat.slug || cat.name })}
                      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                      style={{ aspectRatio: '4/5' }}
                    >
                      <img
                        src={cat.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop'}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.08]"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600'; }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-[52%] z-10"
                        style={{ background: 'linear-gradient(to top,rgba(8,8,22,0.96) 0%,rgba(8,8,22,0.48) 60%,transparent 100%)' }} />
                      <div className="absolute bottom-0 left-0 right-0 z-30 p-4">
                        <div className="h-[2px] w-4 mb-2 bg-[#D4AF37] group-hover:w-8 transition-all duration-500" />
                        <h3 className="font-bold text-sm tracking-wider uppercase text-white leading-tight">{cat.name}</h3>
                        <p className="text-[10px] font-semibold text-amber-400/90 mt-0.5">{cat.productCount || 0} Items</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
          if (isAuthenticated) {
            const role = getNormalizedRole(currentUser);
            if (role === 'seller') {
              setTimeout(() => handleNavigate('seller-dashboard'), 0);
              return null;
            }

            return (
              <UserDashboard
                onNavigate={handleNavigate}
                routeParams={routeParams}
              />
            );
          } else {
            return <Login onNavigate={handleNavigate} />;
          }

        case 'seller-landing':
          return <SellerLanding onNavigate={handleNavigate} />;

        case 'seller-onboarding':
          return <SellerRegister onNavigate={handleNavigate} />;

        case 'seller-dashboard':
          if (!isAuthenticated) {
            console.warn('⚠️ Seller access denied: Not authenticated');
            return <Login onNavigate={handleNavigate} />;
          }

          const isSellerOnboarded = !!currentUser?.storeName || localStorage.getItem('isSellerOnboarded') === 'true';
          if (!isSellerOnboarded) {
            console.warn('⚠️ Seller access denied: Not onboarded yet');
            return <SellerRegister onNavigate={handleNavigate} />;
          }

          return <SellerDashboard onNavigate={handleNavigate} />;

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
          if (isAuthenticated && currentUser) {
            const role = getNormalizedRole(currentUser);

            if (role === 'seller') {
              const onboarded = !!currentUser.storeName;
              localStorage.setItem('isSellerOnboarded', onboarded ? 'true' : 'false');
              localStorage.setItem('isLoggedIn', 'true');
              
              if (onboarded) {
                setTimeout(() => handleNavigate('seller-dashboard'), 0);
              } else {
                setTimeout(() => handleNavigate('seller-onboarding'), 0);
              }
              return null;
            } 
            
            if (isAdminUser(currentUser)) {
              setTimeout(() => handleNavigate('admin-dashboard'), 0);
              return null;
            } 
            
            setTimeout(() => handleNavigate('home'), 0);
            return null;
          }
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
      {/* Dynamic Header/Navbar */}
      {!isSellerPortal && (
        <Navbar
          onNavigate={handleNavigate}
          currentPage={currentPage}
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
        />
      )}

      {/* Main Viewport Content */}
      <main className="flex-1">{renderPage()}</main>

      {/* Premium Footer */}
      {!isSellerPortal && <Footer onNavigate={handleNavigate} />}

      {/* Global Quick View Overlay Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onNavigate={handleNavigate}
        />
      )}

      {/* Hot Toast Notification Config */}
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