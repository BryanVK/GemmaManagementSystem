import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { Menu } from './components/Menu';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    if (storedLoginStatus === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
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
