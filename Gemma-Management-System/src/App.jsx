import './App.css'
import { useState } from 'react'
import { Menu } from './components/Menu'
import { Navbar } from './components/Navbar'
import { Table } from './components/Table'
import { Login } from './components/Login'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {isLoggedIn ? (
        <>
          <Navbar />
          <Menu />
          <Table />
        </>
      ) : (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </>
  );
}

export default App
