import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpenseList from './expenseList';

const Dashboard = () => {
    const [monthlySummary, setMonthlySummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch monthly summary
    const fetchMonthlySummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const currentDate = new Date();
            const response = await fetch(`/api/expenses/summary?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch monthly summary');
            }

            const data = await response.json();
            setMonthlySummary(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        // Remove stored credentials
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        // Redirect to login
        navigate('/login');
    };

    // Fetch summary on component mount
    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        fetchMonthlySummary();
    }, [navigate]);

    // Render loading state
    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    // Render error state
    if (error) {
        return (
            <div>
                <p>Error: {error}</p>
                <button onClick={handleLogout}>Logout</button>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Expense Tracker Dashboard</h1>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </header>

            <section className="monthly-summary">
                <h2>Monthly Expense Summary</h2>
                <div className="total-expenses">
                    <span>Total Expenses: </span>
                    <strong>${monthlySummary.totalExpenses.toFixed(2)}</strong>
                </div>

                <div className="category-breakdown">
                    <h3>Expenses by Category</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Total Amount</th>
                                <th>Transactions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlySummary.categories.map((category) => (
                                <tr key={category.category}>
                                    <td>{category.category}</td>
                                    <td>${category.total_amount.toFixed(2)}</td>
                                    <td>{category.transaction_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="expense-list-section">
                <h2>Recent Expenses</h2>
                <ExpenseList />
            </section>
        </div>
    );
};

export default Dashboard;