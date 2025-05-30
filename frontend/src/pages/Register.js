// Register.js: A React component for user registration, allowing users to create a new account with username, email, and password.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import '../styles/Auth.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords don\'t match');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await authService.register(username, email, password);
            navigate('/login', { state: { message: 'Registration successful! Please log in.'} });
        } catch (error) {
            setError(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='auth-container'>
            <div className='auth-card'>
                <h2>Registration</h2>
                {error && <div className='alert alert-danger'>{error}</div>}
                <form onSubmit={handleRegister}>
                    <div className='mb-3'>
                        <label htmlFor='username' className='form-label'>
                            Username 
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='email' className='form-label'>
                            Email 
                        </label>
                        <input
                            type='email'
                            className='form-control'
                            id='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='password' className='form-label'>
                            Password 
                        </label>
                        <input
                            type='password'
                            className='form-control'
                            id='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='confirmPassword' className='form-label'>
                            Confirm Password 
                        </label>
                        <input
                            type='password'
                            className='form-control'
                            id='confirmPassword'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type='submit'
                        className='btn btn-primary w-100'
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className='mt-3 text-center'>
                    Already have an account?{' '}
                    <Link to='/login'>Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;