import './App.css';
import { useEffect, useState } from 'react';
import { Menu } from './components/Menu';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';

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

        // Auto logout saat expired
        const timeout = expiredTime.getTime() - now.getTime();
        const timer = setTimeout(() => {
          handleLogout();
          alert("Sesi login berakhir, silakan login kembali.");
        }, timeout);

        return () => clearTimeout(timer);
      } else {
        handleLogout(); // expired langsung logout
      }
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");

    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 2); // 2 jam ke depan
    localStorage.setItem("expiredAt", expiredAt.toISOString());
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("expiredAt");
    localStorage.removeItem("user"); // opsional kalau kamu simpan data user juga
  };

  return (
    <>
      {isLoggedIn ? (
        <>
          <Navbar onLogout={handleLogout} />
          <Menu />
        </>
      ) : (
        <Login onLoginSuccess={handleLogin} />
      )}
    </>
  );
}

export default App;
