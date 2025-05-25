import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Gamepad2, ChevronDown, Menu, X } from "lucide-react";

const games = [
  { name: "2048", path: "/game2048" },
  { name: "Rock Paper Scissors", path: "/rock-paper-scissor" },
  { name: "Sudoku", path: "/sudoku" },
  { name: "Memory Matching", path: "/memory-matching" },
  { name: "Tic Tac Toe", path: "/tic-tac-toe" },
  { name: "Maze Game", path: "/maze-game" },
  { name: "Brick Breaker", path: "/brick-breaker" },
  { name: "Dots & Boxes", path: "/dots-boxes" },
  { name: "Flappy Bird", path: "/flappy-bird" },
  { name: "Minesweeper", path: "/minesweeper" },
  { name: "Snake & Ladder", path: "/snake-ladder" },
];

const Navbar = () => {
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gamesDropdownOpen, setGamesDropdownOpen] = useState(false);
  const [mobileGamesDropdownOpen, setMobileGamesDropdownOpen] = useState(false); // Controlled mobile dropdown state
  const [announceMessage, setAnnounceMessage] = useState("");

  const dropdownRef = useRef(null);
  const gamesButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);

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
        ? "text-cyan-400 font-semibold"
        : "hover:text-cyan-400 transition-colors duration-150",
    [location.pathname]
  );

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
        className="bg-slate-900 text-white shadow-md sticky top-0 z-50 select-none"
        role="navigation"
        aria-label="Primary navigation"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}

          {/* <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold hover:text-cyan-400 transition-colors duration-200"
            aria-label="Go to homepage"
          >
            <Gamepad2 className="text-cyan-400" />
            The Web Arcade
          </Link> */}

          <Link
            to="/"
            className="flex items-center gap-4 text-3xl font-bold hover:text-cyan-400 transition-colors duration-200"
            aria-label="Go to homepage"
          >
            <img
              src="/logo.png"
              alt="The Web Arcade Logo"
              className="w-14 h-14 hover:scale-110 transition-transform rounded-full border-2 border-white shadow-lg object-cover"
            />
            The Web Arcade
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-8 text-xl font-medium">
            <li>
              <Link to="/" className={activeLinkClass("/")}>
                Home
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
                className={`flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded transition-colors duration-150 ${
                  gamesDropdownOpen
                    ? "text-cyan-400 font-semibold"
                    : "hover:text-cyan-400"
                }`}
              >
                Games{" "}
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
                className={`absolute top-full mt-2 w-48 bg-slate-800 rounded-md shadow-lg overflow-hidden transition-opacity duration-200 ease-in-out ${
                  gamesDropdownOpen
                    ? "opacity-100 visible"
                    : "opacity-0 invisible pointer-events-none"
                }`}
              >
                {games.map(({ name, path }) => (
                  <li key={name} role="none">
                    <Link
                      to={path}
                      className={`block px-4 py-2 text-sm text-white hover:bg-slate-700 focus:bg-slate-700 focus:outline-none ${
                        location.pathname === path
                          ? "bg-slate-700 text-cyan-400 font-semibold"
                          : ""
                      }`}
                      role="menuitem"
                      tabIndex={gamesDropdownOpen ? 0 : -1}
                      onClick={() => setGamesDropdownOpen(false)}
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li>
              <Link to="/about" className={activeLinkClass("/about")}>
                About Us
              </Link>
            </li>
          </ul>

          {/* Mobile Hamburger */}
          <button
            onClick={() => {
              setMobileMenuOpen((open) => !open);
              if (mobileMenuOpen) setMobileGamesDropdownOpen(false);
            }}
            className="md:hidden focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
            aria-label={
              mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"
            }
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Blur and dark overlay for mobile menu */}
      <div
        aria-hidden={!mobileMenuOpen}
        className={`fixed inset-0 z-40 transition-opacity duration-300 ease-in-out pointer-events-none ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
        }`}
        style={{
          backdropFilter: mobileMenuOpen ? "blur(8px)" : "none",
          WebkitBackdropFilter: mobileMenuOpen ? "blur(8px)" : "none",
          backgroundColor: mobileMenuOpen ? "rgba(0,0,0,0.3)" : "transparent",
          transitionProperty: "opacity, backdrop-filter, background-color",
        }}
        onClick={() => {
          setMobileMenuOpen(false);
          setMobileGamesDropdownOpen(false);
        }}
      ></div>

      {/* Mobile Menu */}
      <nav
        ref={mobileMenuRef}
        className={`fixed top-0 left-0 z-50 w-72 max-w-full h-full bg-slate-900 shadow-xl p-8 flex flex-col gap-8 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="menu"
        aria-label="Mobile primary navigation"
      >
        <Link
          to="/"
          className={`block text-lg font-medium px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors ${
            location.pathname === "/"
              ? "text-cyan-400 font-semibold"
              : "text-white hover:text-cyan-400"
          }`}
          onClick={() => setMobileMenuOpen(false)}
          role="menuitem"
          tabIndex={mobileMenuOpen ? 0 : -1}
        >
          Home
        </Link>

        {/* Games submenu for mobile */}
        <div>
          <button
            onClick={() => setMobileGamesDropdownOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={mobileGamesDropdownOpen}
            aria-controls="mobile-games-menu"
            className={`flex items-center justify-between w-full px-2 py-2 font-semibold text-lg rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors ${
              mobileGamesDropdownOpen
                ? "text-cyan-400"
                : "text-white hover:text-cyan-400"
            }`}
          >
            Games
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
            className={`mt-2 pl-4 flex flex-col gap-2 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
              mobileGamesDropdownOpen
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            {games.map(({ name, path }) => (
              <li key={name}>
                <Link
                  to={path}
                  className={`block px-2 py-1 rounded text-base font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors ${
                    location.pathname === path
                      ? "text-cyan-400 font-semibold"
                      : "text-white hover:text-cyan-400"
                  }`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setMobileGamesDropdownOpen(false);
                  }}
                  role="menuitem"
                  tabIndex={mobileMenuOpen && mobileGamesDropdownOpen ? 0 : -1}
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link
          to="/about"
          className={`block text-lg font-medium px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors ${
            location.pathname === "/about"
              ? "text-cyan-400 font-semibold"
              : "text-white hover:text-cyan-400"
          }`}
          onClick={() => setMobileMenuOpen(false)}
          role="menuitem"
          tabIndex={mobileMenuOpen ? 0 : -1}
        >
          About Us
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
