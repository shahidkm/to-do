import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Function to navigate and close mobile menu
  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav className="bg-blue-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center text-blue-800 font-bold text-xl cursor-pointer"
            onClick={() => handleNavigate("/")}
          >
            SHAHID KM
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            <button
              onClick={() => handleNavigate("/")}
              className="text-blue-800 hover:bg-blue-200 px-3 py-2 rounded-md"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigate("/performance-dashboard")}
              className="text-blue-800 hover:bg-blue-200 px-3 py-2 rounded-md"
            >
              Performance
            </button>
            <button
              onClick={() => handleNavigate("/reward-dashboard")}
              className="text-blue-800 hover:bg-blue-200 px-3 py-2 rounded-md"
            >
              Rewards
            </button>
            <button
              onClick={() => handleNavigate("/plans")}
              className="text-blue-800 hover:bg-blue-200 px-3 py-2 rounded-md"
            >
              Plans
            </button>
            <button
              onClick={() => handleNavigate("/inspirations")}
              className="text-blue-800 hover:bg-blue-200 px-3 py-2 rounded-md"
            >
              Inspirations
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-blue-800 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-50 px-2 pt-2 pb-3 space-y-1">
          <button
            className="block text-blue-800 hover:bg-blue-200 px-3 py-2 rounded-md w-full text-left"
            onClick={() => handleNavigate("/")}
          >
            Home
          </button>
          <button
            className="block text-blue-800 hover:bg-blue-200 px-3 py-2 rounded-md w-full text-left"
            onClick={() => handleNavigate("/performance-dashboard")}
          >
            Performance
          </button>
          <button
            className="block text-blue-800 hover:bg-blue-200 px-3 py-2 rounded-md w-full text-left"
            onClick={() => handleNavigate("/reward-dashboard")}
          >
            Rewards
          </button>
          <button
            className="block text-blue-800 hover:bg-blue-200 px-3 py-2 rounded-md w-full text-left"
            onClick={() => handleNavigate("/plans")}
          >
            Plans
          </button>
          <button
            className="block text-blue-800 hover:bg-blue-200 px-3 py-2 rounded-md w-full text-left"
            onClick={() => handleNavigate("/inspirations")}
          >
            Inspirations
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;