import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Landing from "./components/Landing.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Interview from "./components/Interview.jsx";
import Dashboard from "./components/Dashboard.jsx";
import PrepLibrary from "./components/PrepLibrary.jsx";

const App = () => {
  const [auth, setAuth] = useState(!!localStorage.getItem("token"));
  return (
    <ThemeProvider>
      <Router>
        <Navbar setAuth={setAuth} auth={auth} />
        <Routes>
          <Route path="/" element={auth ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/login" element={auth ? <Navigate to="/dashboard" /> : <Login setAuth={setAuth} />} />
          <Route path="/register" element={auth ? <Navigate to="/dashboard" /> : <Register setAuth={setAuth} />} />
          <Route path="/interview" element={auth ? <Interview /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={auth ? <Dashboard setAuth={setAuth} /> : <Navigate to="/login" />} />
          <Route path="/prep" element={auth ? <PrepLibrary /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
