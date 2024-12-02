import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Store token and user ID
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        // Reset form data when switching modes
        setFormData({
            username: '',
            email: '',
            password: ''
        });
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>{isLogin ? 'Login' : 'Register'}</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                {!isLogin && (
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                    />
                </div>

                <button type="submit" className="submit-btn">
                    {isLogin ? 'Login' : 'Register'}
                </button>

                <div className="auth-toggle">
                    {isLogin 
                        ? "Don't have an account? " 
                        : "Already have an account? "}
                    <button 
                        type="button" 
                        onClick={toggleAuthMode}
                        className="toggle-btn"
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AuthForm;