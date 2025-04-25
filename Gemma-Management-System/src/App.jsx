import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { Menu } from './components/Menu';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    const expiredAt = localStorage.getItem("expiredAt");

    if (storedLoginStatus === "true" && expiredAt) {
      const now = new Date();
      const expiredTime = new Date(expiredAt);

      if (now < expiredTime) {
        setIsLoggedIn(true);
        const timeout = expiredTime.getTime() - now.getTime();
        const timer = setTimeout(() => {
          handleLogout();
          alert("Sesi login berakhir, silakan login kembali.");
        }, timeout);
        return () => clearTimeout(timer);
      } else {
        handleLogout();
      }
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 10);
    localStorage.setItem("expiredAt", expiredAt.toISOString());
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.clear();
  };

  return (
    <Router>
      {isLoggedIn ? (
        <>
          <Navbar onLogout={handleLogout} />
          <Routes>
            <Route path="/*" element={<Menu />} />
          </Routes>
        </>
      ) : (
        <Login onLoginSuccess={handleLogin} />
      )}
    </Router>
  );
}

export default App;
