import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import '../styles/Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <nav className='navbar navbar-expand-lg navbar-dark bg-primary'>
            <div className='container'>
                <Link className='navbar-brand' to='/'>
                    My IMC Tracker
                </Link>
                <button
                    className='navbar-toggler'
                    type='button'
                    data-bs-toggle='collapse'
                    data-bs-target='#navbarNav'
                >
                    <span className='navbar-toggler-icon'></span>
                </button>
                <div className='collapse navbar-collapse' id='navbarNav'>
                    <ul className='navbar-nav ms-auto'>
                        {currentUser ? (
                            <>
                                <li className='nav-item'>
                                    <Link className='nav-link' to='/dashboard'>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className='nav-item'>
                                    <button className='nav-link btn btn-link' onClick={handleLogout}>
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className='nav-item'>
                                    <Link className='nav-link' to='/login'>
                                        Login
                                    </Link>
                                </li>
                                <li className='="nav-item'>
                                    <Link className='nav-link' to='register'>
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;