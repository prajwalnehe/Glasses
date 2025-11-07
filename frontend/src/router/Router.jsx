import React from "react";
import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import OutletLayout from "../components/OutletLayout.jsx";
import Home from "../pages/Home.jsx";
import About from "../pages/About.jsx";
import Shop from "../pages/Shop.jsx";
import Cart from "../pages/Cart.jsx";
import Wishlist from "../pages/Wishlist.jsx";
import ProductDetail from "../pages/ProductDetails.jsx";
import Signup from "../pages/Signup.jsx";
import Signin from "../pages/Signin.jsx";
import UserInfo from "../pages/UserInfo.jsx";
import MyOrders from "../pages/MyOrders.jsx";
import Checkout from "../pages/Checkout.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx"; 
import CategoryPage from "../pages/CategoryPage.jsx";
import AdminLayout from "../components/AdminLayout.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import AdminProducts from "../pages/AdminProducts.jsx";
import AdminOrders from "../pages/AdminOrders.jsx";
import { useUser } from "../context/UserContext.jsx";
import { useCart } from "../context/CartContext.jsx";

// Individual wrapper components to provide cart functions
const HomeWithCart = () => {
  const { addToCart, addToWishlist } = useCart();
  return <Home addToCart={addToCart} addToWishlist={addToWishlist} />;
};

const ShopWithCart = () => {
  const { addToCart, addToWishlist } = useCart();
  return <Shop addToCart={addToCart} addToWishlist={addToWishlist} />;
};

const ProductDetailWithCart = () => {
  const { addToCart, addToWishlist } = useCart();
  return <ProductDetail addToCart={addToCart} addToWishlist={addToWishlist} />;
};

const CategoryPageWithCart = () => {
  const { addToCart, addToWishlist } = useCart();
  return <CategoryPage addToCart={addToCart} addToWishlist={addToWishlist} />;
};

const router = () =>
  createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Default route → Redirect to Home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Public layout for browsing */}
        <Route element={<OutletLayout />}>
          <Route path="/home" element={<HomeWithCart />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<ShopWithCart />} />
          <Route path="/product/:id" element={<ProductDetailWithCart />} />
          <Route path="/category/:category" element={<CategoryPageWithCart />} />
        </Route>

        {/* Auth pages (public) */}
        <Route 
          path="/signin" 
          element={
            <PublicOnlyRoute>
              <Signin />
            </PublicOnlyRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          } 
        />

        {/* Protected-only pages */}
        <Route element={<ProtectedRoute><OutletLayout /></ProtectedRoute>}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<UserInfo />} />
          <Route path="/orders" element={<MyOrders />} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>
      </>
    ),
    { future: { v7_startTransition: true } }
  );

// Prevent authenticated users from accessing login/signup pages
const PublicOnlyRoute = ({ children }) => {
  const { user } = useUser();
  if (user) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

export default router;
