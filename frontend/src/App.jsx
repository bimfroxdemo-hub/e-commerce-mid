import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";

import Men from "./pages/Men";
import Women from "./pages/Women";
import Kids from "./pages/Kids";

import Login from "./pages/Login";
import AdminCartPage from "./pages/AdminCartPage";


// ================= USER PROTECTED ROUTE =================

const UserRoute = ({ children }) => {

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};


// ================= ADMIN PROTECTED ROUTE =================

const AdminRoute = ({ children }) => {

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!token || !user || user.role !== "admin") {
    return <Navigate to="/admin-login" />;
  }

  return children;
};


function App() {

  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* SHOP */}
        <Route path="/shop" element={<Shop />} />

        {/* CATEGORY */}
        <Route path="/men" element={<Men />} />
        <Route path="/women" element={<Women />} />
        <Route path="/kids" element={<Kids />} />

        {/* PRODUCT */}
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* LOGIN */}
        <Route path="/login" element={<Login type="user" />} />
        <Route path="/admin-login" element={<Login type="admin" />} />

        {/* USER CART PROTECTED */}
        <Route
          path="/cart"
          element={
            <UserRoute>
              <Cart />
            </UserRoute>
          }
        />

        {/* CHECKOUT */}
        <Route
          path="/checkout"
          element={
            <UserRoute>
              <Checkout />
            </UserRoute>
          }
        />

        {/* CONTACT */}
        <Route path="/contact" element={<Contact />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminCartPage />
            </AdminRoute>
          }
        />

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}

export default App;