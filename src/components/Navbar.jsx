import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, Home, Info, Sparkles } from "lucide-react";

const games = [
  { name: "2048", path: "/game2048", icon: "🎯" },
  { name: "Rock Paper Scissors", path: "/rock-paper-scissor", icon: "✂️" },
  { name: "Sudoku", path: "/sudoku", icon: "🔢" },
  { name: "Memory Matching", path: "/memory-matching", icon: "🧠" },
  { name: "Tic Tac Toe", path: "/tic-tac-toe", icon: "⭕" },
  { name: "Flappy Bird", path: "/flappy-bird", icon: "🐦" },
  { name: "Brick Breaker", path: "/brick-breaker", icon: "🧱" },
  { name: "Dots & Boxes", path: "/dots-boxes", icon: "📦" },
];


const Navbar = () => {
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gamesDropdownOpen, setGamesDropdownOpen] = useState(false);
  const [mobileGamesDropdownOpen, setMobileGamesDropdownOpen] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef(null);
  const gamesButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown & mobile menu on outside click
  const handleClickOutside = useCallback(
    (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        gamesButtonRef.current &&
        !gamesButtonRef.current.contains(event.target)
      ) {
        setGamesDropdownOpen(false);
      }

      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
        setMobileGamesDropdownOpen(false);
      }
    },
    [mobileMenuOpen]
  );

  // Close menus on Escape key
  const handleKeyDown = useCallback((event) => {
    if (event.key === "Escape") {
      setGamesDropdownOpen(false);
      setMobileMenuOpen(false);
      setMobileGamesDropdownOpen(false);
      gamesButtonRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClickOutside, handleKeyDown]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setGamesDropdownOpen(false);
    setMobileGamesDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll on mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Announce menu open/close for screen readers
  useEffect(() => {
    if (gamesDropdownOpen) {
      setAnnounceMessage("Games menu opened");
    } else if (mobileGamesDropdownOpen) {
      setAnnounceMessage("Games submenu opened");
    } else if (mobileMenuOpen) {
      setAnnounceMessage("Mobile menu opened");
    } else {
      setAnnounceMessage("Menus closed");
    }
  }, [gamesDropdownOpen, mobileGamesDropdownOpen, mobileMenuOpen]);

  const activeLinkClass = useCallback(
    (path) =>
      location.pathname === path
        ? "text-cyan-400 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-cyan-400 after:rounded-full"
        : "hover:text-cyan-400 transition-colors duration-200 relative group",
    [location.pathname]
  );

  const isActiveGame = games.some(game => game.path === location.pathname);

  return (
    <>
      {/* Screen reader live region */}
      <div
        aria-live="polite"
        role="status"
        className="sr-only"
        aria-atomic="true"
      >
        {announceMessage}
      </div>

      <nav
        className={`bg-slate-900/95 backdrop-blur-md text-white shadow-lg sticky top-0 z-50 select-none transition-all duration-300 ${
          isScrolled ? "py-2 shadow-xl border-b border-slate-700/50" : "py-3"
        }`}
        role="navigation"
        aria-label="Primary navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 text-2xl sm:text-3xl font-bold hover:text-cyan-400 transition-all duration-300 group"
              aria-label="Go to homepage"
            >
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="The Web Arcade Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 hover:scale-110 transition-transform duration-300 rounded-full border-2 border-white/50 group-hover:border-cyan-400 shadow-lg object-cover"
                />
              </div>
              <span className="hidden sm:block bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                The Web Arcade
              </span>
              <span className="sm:hidden text-lg">TWA</span>
            </Link>

            {/* Desktop Menu */}
            <ul className="hidden lg:flex items-center gap-8 text-lg font-medium">
              <li>
                <Link 
                  to="/" 
                  className={`${activeLinkClass("/")} flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/50`}
                >
                  <Home className="w-4 h-4" />
                  Home
                  {location.pathname !== "/" && (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
                  )}
                </Link>
              </li>

              {/* Games Dropdown */}
              <li className="relative" ref={dropdownRef}>
                <button
                  ref={gamesButtonRef}
                  onClick={() => setGamesDropdownOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={gamesDropdownOpen}
                  aria-controls="games-menu"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 hover:bg-slate-800/50 ${
                    gamesDropdownOpen || isActiveGame
                      ? "text-cyan-400 font-semibold bg-slate-800/30"
                      : "hover:text-cyan-400"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Games
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                      gamesDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Dropdown menu */}
                <ul
                  id="games-menu"
                  role="menu"
                  aria-label="Games submenu"
                  className={`absolute top-full mt-2 w-64 bg-slate-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden transition-all duration-300 ease-out ${
                    gamesDropdownOpen
                      ? "opacity-100 visible transform translate-y-0"
                      : "opacity-0 invisible pointer-events-none transform -translate-y-2"
                  }`}
                >
                  {games.map(({ name, path, icon }, index) => (
                    <li key={name} role="none">
                      <Link
                        to={path}
                        className={`flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-slate-700/50 focus:bg-slate-700/50 focus:outline-none transition-all duration-200 ${
                          location.pathname === path
                            ? "bg-slate-700/70 text-cyan-400 font-semibold border-r-2 border-cyan-400"
                            : "hover:translate-x-1"
                        }`}
                        role="menuitem"
                        tabIndex={gamesDropdownOpen ? 0 : -1}
                        onClick={() => setGamesDropdownOpen(false)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <span className="text-lg">{icon}</span>
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              <li>
                <Link 
                  to="/about" 
                  className={`${activeLinkClass("/about")} flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/50`}
                >
                  <Info className="w-4 h-4" />
                  About Us
                  {location.pathname !== "/about" && (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
                  )}
                </Link>
              </li>
            </ul>

            {/* Mobile & Tablet Menu Toggle */}
            <button
              onClick={() => {
                setMobileMenuOpen((open) => !open);
                if (mobileMenuOpen) setMobileGamesDropdownOpen(false);
              }}
              className="lg:hidden focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-lg p-2 hover:bg-slate-800/50 transition-colors duration-200"
              aria-label={
                mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"
              }
              aria-expanded={mobileMenuOpen}
            >
              <div className="relative w-6 h-6">
                <Menu 
                  className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-0 rotate-180" : "opacity-100 rotate-0"
                  }`} 
                />
                <X 
                  className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-180"
                  }`} 
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Blur and dark overlay for mobile menu */}
      <div
        aria-hidden={!mobileMenuOpen}
        className={`fixed inset-0 z-40 transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? "opacity-100 pointer-events-auto backdrop-blur-sm bg-black/30" 
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => {
          setMobileMenuOpen(false);
          setMobileGamesDropdownOpen(false);
        }}
      />

      {/* Mobile Menu */}
      <nav
        ref={mobileMenuRef}
        className={`fixed top-0 left-0 z-50 w-80 sm:w-96 max-w-[90vw] h-full bg-slate-900/98 backdrop-blur-md shadow-2xl border-r border-slate-700/50 flex flex-col transform transition-all duration-300 ease-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="menu"
        aria-label="Mobile primary navigation"
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <Link
            to="/"
            className="flex items-center gap-3 text-xl font-bold text-cyan-400"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-8 h-8 rounded-full border border-cyan-400/30"
            />
            The Web Arcade
          </Link>
        </div>

        {/* Mobile Menu Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          <Link
            to="/"
            className={`flex items-center gap-3 text-lg font-medium px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 ${
              location.pathname === "/"
                ? "text-cyan-400 font-semibold bg-slate-800/50 border-l-4 border-cyan-400"
                : "text-white hover:text-cyan-400 hover:bg-slate-800/30"
            }`}
            onClick={() => setMobileMenuOpen(false)}
            role="menuitem"
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <Home className="w-5 h-5" />
            Home
          </Link>

          {/* Games submenu for mobile */}
          <div>
            <button
              onClick={() => setMobileGamesDropdownOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={mobileGamesDropdownOpen}
              aria-controls="mobile-games-menu"
              className={`flex items-center justify-between w-full px-4 py-3 font-medium text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 ${
                mobileGamesDropdownOpen || isActiveGame
                  ? "text-cyan-400 bg-slate-800/50"
                  : "text-white hover:text-cyan-400 hover:bg-slate-800/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                Games
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
                  mobileGamesDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
                aria-hidden="true"
              />
            </button>
            
            <ul
              id="mobile-games-menu"
              role="menu"
              aria-label="Mobile Games submenu"
              className={`mt-2 ml-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                mobileGamesDropdownOpen
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              {games.map(({ name, path, icon }, index) => (
                <li key={name}>
                  <Link
                    to={path}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 ${
                      location.pathname === path
                        ? "text-cyan-400 font-semibold bg-slate-800/30 border-l-2 border-cyan-400"
                        : "text-white hover:text-cyan-400 hover:bg-slate-800/20"
                    }`}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileGamesDropdownOpen(false);
                    }}
                    role="menuitem"
                    tabIndex={mobileMenuOpen && mobileGamesDropdownOpen ? 0 : -1}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      animation: mobileGamesDropdownOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                    }}
                  >
                    <span className="text-lg">{icon}</span>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/about"
            className={`flex items-center gap-3 text-lg font-medium px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 ${
              location.pathname === "/about"
                ? "text-cyan-400 font-semibold bg-slate-800/50 border-l-4 border-cyan-400"
                : "text-white hover:text-cyan-400 hover:bg-slate-800/30"
            }`}
            onClick={() => setMobileMenuOpen(false)}
            role="menuitem"
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <Info className="w-5 h-5" />
            About Us
          </Link>
        </div>

        {/* Mobile Menu Footer */}
        <div className="p-6 border-t border-slate-700/50">
          <div className="text-center text-sm text-slate-400">
            <p>© {new Date().getFullYear()} The Web Arcade</p>
            <p className="text-xs mt-1">Play • Explore • Enjoy</p>
          </div>
        </div>
      </nav>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;