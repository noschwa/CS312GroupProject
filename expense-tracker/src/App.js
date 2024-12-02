import React from 'react';
import { 
    BrowserRouter as Router, 
    Routes, 
    Route, 
    Navigate 
} from 'react-router-dom';

// Authentication
import AuthForm from './components/AuthForm';

// Protected Components
import Dashboard from './components/Dashboard';
import ExpenseList from './components/expenseList';
import ExpenseForm from './components/expenseForm';
import CategoryManagement from './components/categoryManagement';
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

                    {/* Default Route - Redirect to Login or Dashboard */}
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