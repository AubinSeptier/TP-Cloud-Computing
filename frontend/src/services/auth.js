// auth.js: A service module for handling user authentication, including registration, login, logout, and checking authentication status.
import api from './api';

const authService = {
    register: async (username, email, password) => {
        try {
            const response = await api.post('auth/register', {username, email, password});
            return response.data;
        } catch (error) {
            throw error.reponse?.data || { message: 'An error occurred during registration'};
        }
    },

    login: async (email, password) => {
        try {
            const response = await api.post('auth/login', {email, password});
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Invalid credentials'};
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

export default authService;