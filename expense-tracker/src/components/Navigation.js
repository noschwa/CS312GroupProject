import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remove stored credentials
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        // Redirect to login
        navigate('/login');
    };

    return (
        <nav className="main-navigation">
            <div className="nav-logo">
                Expense Tracker
            </div>
            <ul className="nav-links">
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                    <Link to="/expenses">Expenses</Link>
                </li>
                <li>
                    <Link to="/categories">Categories</Link>
                </li>
                <li>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Navigation;