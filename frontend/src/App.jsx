import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Loader from './components/common/Loader';
import SocialProofPopup from './components/conversion/SocialProofPopup';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

// Public pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));

export default function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* Admin routes — own layout, no store header/footer */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <Suspense fallback={<Loader size="lg" />}>
                <AdminDashboard />
              </Suspense>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminProtectedRoute>
              <Suspense fallback={<Loader size="lg" />}>
                <AdminOrders />
              </Suspense>
            </AdminProtectedRoute>
          }
        />

        {/* Public store routes */}
        <Route
          path="/*"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <Suspense fallback={<Loader size="lg" />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/confirmation" element={<Confirmation />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <SocialProofPopup />
            </div>
          }
        />
      </Routes>
    </AdminAuthProvider>
  );
}
