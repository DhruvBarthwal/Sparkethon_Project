import React, { useEffect, useState } from "react";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaHeart,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase-config";
import { signOut } from "firebase/auth";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const Navbar = ({ setIsAuth }) => {
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
    };

    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);

    // Check auth token
    const token = cookies.get("auth-token");
    setIsLoggedIn(!!token);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  const signUserOut = async () => {
    try {
      await signOut(auth);
      cookies.remove("auth-token");
      setIsAuth(false);
      setIsLoggedIn(false);
      navigate("/signin");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="bg-[#0053E2] shadow-md px-8 py-4 flex items-center justify-between">
      {/* Logo + Location */}
      <div className="flex items-center space-x-4">
        <div onClick={() => navigate("/")} className="cursor-pointer">
          <img src="Logo.png" alt="Logo" className="h-10 w-auto" />
        </div>

        <div className="flex items-center text-gray-100 text-sm">
          <FaMapMarkerAlt className="mr-1 text-white" />
          <span>
            Deliver to <strong className="ml-1">Your Location</strong>
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 mx-6">
        <div className="flex w-full h-14 border border-gray-300 bg-white rounded-full overflow-hidden">
          <input
            type="text"
            placeholder="Search everything at Walmart online and in store"
            className="px-4 py-2 w-full focus:outline-none"
          />
          <button className="bg-blue-600 px-4 text-white">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6 text-sm">
        {/* Reorder */}
        <div className="flex flex-col items-center hover:text-blue-300 cursor-pointer">
          <div className="flex items-center space-x-1">
            <FaHeart className="text-lg text-white" />
            <span className="text-white text-lg font-medium">Reorder</span>
          </div>
          <span className="text-white text-xs">My Items</span>
        </div>

        {/* Sign In / Sign Out */}
        {isLoggedIn ? (
          <button
            className="flex items-center space-x-1 hover:text-blue-300 cursor-pointer"
            onClick={signUserOut}
          >
            <FaUser className="text-lg text-white" />
            <span className="text-white text-lg">Sign Out</span>
          </button>
        ) : (
          <button
            className="flex items-center space-x-1 hover:text-blue-300 cursor-pointer"
            onClick={() => navigate("/signin")}
          >
            <FaUser className="text-lg text-white" />
            <span className="text-white text-lg">Sign In</span>
          </button>
        )}

        {/* Cart */}
        <button
          className="relative cursor-pointer flex items-center space-x-1 hover:text-blue-300"
          onClick={() => navigate("/view-cart")}
        >
          <FaShoppingCart className="text-lg text-white" />
          <span className="text-lg text-white">Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
