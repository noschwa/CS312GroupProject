import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpenseList from './expenseList';
import SpendingVisualization from './spendingVisualization';
import './Dashboard.css';

const Dashboard = () => {
    const [monthlySummary, setMonthlySummary] = useState({ categories: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMonthlySummary = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/monthly-summary', {
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

        fetchMonthlySummary();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

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

            <section className="spending-visualization-section">
                <SpendingVisualization />
            </section>

            <section className="expense-list-section">
                <h2>Recent Expenses</h2>
                <ExpenseList />
            </section>
        </div>
    );
};

export default Dashboard;