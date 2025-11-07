import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, User, LogOut } from "lucide-react";
import { CartContext } from "../context/CartContext";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { cart, wishlist } = useContext(CartContext);
  const { user, logout } = useUser();
  const [accountOpen, setAccountOpen] = useState(false);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  return (
    <nav className="flex justify-between items-center bg-gray-800 text-white p-4 shadow sticky top-0 z-50">
      {/* Left: Logo */}
      <div
        className="cursor-pointer flex items-center gap-2"
        onClick={() => navigate("/home")}
      >
        <img
          src="https://res.cloudinary.com/dfhjtmvrz/image/upload/v1762174634/20251103_182346_rujtql.png"
          alt="LensLogic Logo"
          className="h-18 w-auto object-contain drop-shadow"
          style={{ maxWidth: 200 }}
        />
      </div>

      {/* Center: Navigation Links */}
      <ul className="hidden md:flex text-lg gap-6">
        <li>
          <Link to="/home" className="hover:text-blue-300">Home</Link>
        </li>
        <li>
          <Link to="/about" className="hover:text-blue-300">About</Link>
        </li>
        <li>
          <Link to="/shop" className="hover:text-blue-300">Shop</Link>
        </li>
      </ul>

      {/* Right: Cart, Wishlist, Account */}
      <div className="flex items-center gap-4 relative">
        {/* Cart */}
        <div className="relative">
          <Link 
            to={user ? "/cart" : "/signin"} 
            className="flex items-center gap-1 hover:text-blue-300"
          >
            <ShoppingCart size={24} />
            <span className="hidden sm:inline">Cart</span>
            {totalCartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </Link>
        </div>

        {/* Wishlist */}
        <div className="relative">
          <Link 
            to={user ? "/wishlist" : "/signin"} 
            className="flex items-center gap-1 hover:text-blue-300"
          >
            <Heart size={24} />
            <span className="hidden sm:inline">Wishlist</span>
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
        </div>

        {/* Account dropdown */}
        <div className="relative">
          {user ? (
            <>
              <button
                onClick={() => setAccountOpen((o) => !o)}
                className="flex items-center gap-2 hover:text-blue-300"
              >
                <User size={22} />
                <span className="hidden sm:inline">Account</span>
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      User Info
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <span className="flex items-center">
                        <User size={16} className="mr-2" />
                        User Info
                      </span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        My Orders
                      </span>
                    </Link>
                    {user?.isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 text-purple-600 font-medium"
                      >
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Panel
                        </span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link
              to="/signin"
              className="flex items-center gap-2 hover:text-blue-300"
            >
              <User size={22} />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
