// App.js: Main application component that sets up routing and authentication
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RecordDetail from './pages/RecordDetail';
import authService from './services/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to='/login' />;
};

function App() {
  return (
    <Router>
      <div className='App'>
        <Navbar />
        <div className='main-content'>
          <Routes>
            <Route path='/' element={<Navigate to='/login' />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route
              path='/dashboard'
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path='/record/:id'
              element={
                <PrivateRoute>
                  <RecordDetail />
                </PrivateRoute>            
              }
            />
            <Route path='*' element={<Navigate to='/login' />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
