import './App.css'
import { useEffect, useState } from 'react'
import { Menu } from './components/Menu'
import { Navbar } from './components/Navbar'
import { Login } from './components/Login'

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
    localStorage.removeItem("isLoggedIn");
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
