import type { FC, ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import CurrencySelector from "./CurrencySelector";
import logo from "../assets/sam.png";
import logodark from "../assets/samdark.png";

interface LayoutProp {
  children: ReactNode;
}

const Layout: FC<LayoutProp> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <img src={logo} alt="Sam Flights" className="h-15 w-auto" />
              
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#flight-status"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Flight Status
              </a>
              <a
                href="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                About
              </a>
              <a
                href="/contact"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Contact
              </a>
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {/* Currency Selector */}
              <CurrencySelector />

              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onMouseEnter={() => setIsMenuOpen(true)}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 hover:border-blue-600 transition-colors"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold hover:bg-blue-700 transition-colors">
                        {getInitials()}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200"
                      onMouseLeave={() => setIsMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.displayName || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      <a
                        href="#profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        Profile
                      </a>
                      <Link
                        to="/my-bookings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Bookings
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to={"/login"}>
                  <button className="hidden md:block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Login
                  </button>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <a
                  href="#flight-status"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-2 hover:bg-gray-50 rounded"
                >
                  Flight Status
                </a>
                <a
                  href="#about"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-2 hover:bg-gray-50 rounded"
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-2 hover:bg-gray-50 rounded"
                >
                  Contact
                </a>
                {user && (
                  <Link
                    to="/my-bookings"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-2 hover:bg-gray-50 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                )}
                {!user && (
                  <Link to="/login">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium mt-2 w-full">
                      Login
                    </button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logodark} alt="Sam Flights" className="h-50 w-auto" />
              
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted partner for seamless flight experiences. Book,
                track, and manage your flights with ease.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#flight-status"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    Flight Status
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#terms"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: support@samflights.com</li>
                <li>Phone: +27767430065</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Sam Flights. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
