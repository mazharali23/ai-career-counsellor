import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Chat from './pages/Chat/Chat';
import Dashboard from './pages/Dashboard/Dashboard';
import Opportunities from './pages/Opportunities/Opportunities';
import Profile from './pages/Profile/Profile';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { Toaster } from './components/Toaster/Toaster';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/chat" 
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/opportunities" 
                  element={
                    <ProtectedRoute>
                      <Opportunities />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Toaster />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
