import React from 'react';
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes
} from 'react-router-dom';
import './App.css';
import SpendingVisualization from './components/spendingVisualization';

// Authentication
import AuthForm from './components/AuthForm';

// Protected Components
import CategoryManagement from './components/CategoryManagement';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/expenseForm';
import ExpenseList from './components/expenseList';
import Navigation from './components/Navigation';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            <Navigation />
            {children}
        </>
    );
};

function App() {
    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>Financial Dashboard</h1>
                </header>
                <SpendingVisualization />
                <Routes>
                    {/* Authentication Routes */}
                    <Route 
                        path="/login" 
                        element={<AuthForm />} 
                    />

                    {/* Protected Routes */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                    
                    <Route 
                        path="/expenses" 
                        element={
                            <ProtectedRoute>
                                <ExpenseList />
                            </ProtectedRoute>
                        } 
                    />

                    <Route 
                        path="/expenses/new" 
                        element={
                            <ProtectedRoute>
                                <ExpenseForm />
                            </ProtectedRoute>
                        } 
                    />

                    <Route 
                        path="/categories" 
                        element={
                            <ProtectedRoute>
                                <CategoryManagement />
                            </ProtectedRoute>
                        } 
                    />

                    <Route 
                        path="/categories/manage" 
                        element={
                            <ProtectedRoute>
                                <CategoryManagement />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Default Route - Redirect to Login */}
                    <Route 
                        path="/" 
                        element={<Navigate to="/login" replace />} 
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
