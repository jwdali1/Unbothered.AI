import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import SignUp from './SignUp';
import SignIn from './SignIn';
import Journal from './Journal';
import AccountSettings from './AccountSettings';
import './App.css';
import Color from 'color';

function GearIcon() {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#F5F5F5"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-settings-icon text-white"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
  );
}

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const desktopToggleRef = useRef(null);
  const [popupLeft, setPopupLeft] = useState(0);

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('unbothered_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('accent_color') || '#14a72f';
  });

  const presetColors = ['#14a72f', '#e91e63', '#3f51b5', '#ff9800', '#4caf50', '#9c27b0', '#2196f3'];

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('unbothered_user');
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('unbothered_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
      if (desktopToggleRef.current) {
        const rect = desktopToggleRef.current.getBoundingClientRect();
        setPopupLeft(rect.left + rect.width / 2);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize(); // set position on mount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    try {
      const darkAccent = Color(accentColor).darken(0.7).hex();
      document.documentElement.style.setProperty('--accent-color-dark', darkAccent);
    } catch (err) {
      console.warn('Invalid color selected', err);
    }
    localStorage.setItem('accent_color', accentColor);
  }, [accentColor]);

  return (
    <Router>
      <header className="main-header">
        <nav className="navbar">
          <div className="navbar-left">
            <Link to="/" className="text-logo" draggable="false">
              <h2 className="logo-text">
                <span className="logo-white">Unbothered.</span>
                <span className="green-text">AI</span>
              </h2>
            </Link>
          </div>

          {/* Hamburger Icon */}
          <div
            className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span />
            <span />
            <span />
          </div>

          {/* Desktop Menu */}
          <div className="navbar-right desktop-menu">
            <div className="color-picker-wrapper">
              <div
  className={`color-picker-toggle ${showColorPicker ? 'open' : ''}`}
                ref={desktopToggleRef}
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Customize Accent Color"
                style={{ cursor: 'pointer' }}
                aria-label="Toggle color picker"
              >
                <GearIcon size={24} color="var(--accent-color)" />
              </div>
              {/* Desktop Menu Picker */}
              {windowWidth > 827 && (
                <div
                  className={`color-picker-popup desktop-popup ${showColorPicker ? 'show' : ''}`}
                  style={{
                    position: 'fixed',
                    top: 68,
                    left: popupLeft,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {presetColors.map(color => (
                    <div
                      key={color}
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setAccentColor(color);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {!user && (
              <>
                <NavLink to="/signup" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Sign Up
                </NavLink>
                <NavLink to="/signin" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Sign In
                </NavLink>
              </>
            )}
            {user && (
              <>
                <NavLink
                  to="/journal"
                  className={({ isActive }) =>
                    isActive ? 'active journaling-btn' : 'journaling-btn'
                  }
                >
                  Journaling
                </NavLink>
                <NavLink
                  to="/account"
                  className={({ isActive }) =>
                    isActive ? 'active account-btn' : 'account-btn'
                  }
                >
                  Account Settings
                </NavLink>
                <NavLink
                  to="/"
                  onClick={e => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="navbar-link"
                  style={{ marginLeft: '0.5rem', cursor: 'pointer' }}
                >
                  Logout
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            {!user && (
              <>
                <NavLink
                  to="/signup"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </NavLink>
                <NavLink
                  to="/signin"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </NavLink>
                                            <div className="color-picker-wrapper">
              <div
  className={`color-picker-toggle ${showColorPicker ? 'open' : ''}`}
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Customize Accent Color"
                style={{ cursor: 'pointer' }}
                aria-label="Toggle color picker"
              >
                <GearIcon size={24} color="var(--accent-color)" />
              </div>
              {windowWidth <= 827 && (
                <div
                  className={`color-picker-popup mobile-color-picker ${showColorPicker ? 'show' : ''}`}
                >
                  {presetColors.map(color => (
                    <div
                      key={color}
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setAccentColor(color);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
              </>
            )}
            {user && (
              <>
                <NavLink
                  to="/journal"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Journaling
                </NavLink>
                <NavLink
                  to="/account"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Account Settings
                </NavLink>
                <NavLink
                  to="/"
                  onClick={e => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="navbar-link"
                >
                  Logout
                </NavLink>
                            <div className="color-picker-wrapper">
              <div
  className={`color-picker-toggle ${showColorPicker ? 'open' : ''}`}
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Customize Accent Color"
                style={{ cursor: 'pointer' }}
                aria-label="Toggle color picker"
              >
                <GearIcon size={24} color="var(--accent-color)" />
              </div>
              {windowWidth <= 827 && (
                <div
                  className={`color-picker-popup mobile-color-picker ${showColorPicker ? 'show' : ''}`}
                >
                  {presetColors.map(color => (
                    <div
                      key={color}
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setAccentColor(color);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
              </>
            )}
          </div>
        </nav>
      </header>

      <main style={{ marginTop: '64px' }}>
        <Routes>
          <Route path="/signup" element={<SignUp setUser={setUser} />} />
          <Route path="/signin" element={<SignIn setUser={setUser} />} />
          <Route path="/journal" element={user ? <Journal /> : <Home />} />
          {user && <Route path="/account" element={<AccountSettings user={user} />} />}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </Router>
  );
}

function Home() {
  return (
    <>
    <section className="home-section">
      <h2>
        Journal your <span className="green-text">Thoughts</span>
      </h2>
    </section>
    </>
  );
}

export default App;
