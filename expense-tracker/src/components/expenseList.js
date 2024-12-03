import React, { useState, useEffect } from 'react';

const ExpenseList = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        limit: 10
    });
    const [filters, setFilters] = useState({
        categoryId: '',
        startDate: '',
        endDate: ''
    });

    // Fetch expenses with pagination and filters
    const fetchExpenses = async () => {
        try {
            setLoading(true);
        //     const token = localStorage.getItem('token');
            
        //     // Construct query parameters
        //     const params = new URLSearchParams({
        //         page: pagination.page,
        //         limit: pagination.limit,
        //         ...filters
        //     });

        //     const response = await fetch(`/api/expenses?${params}`, {
        //         method: 'GET',
        //         headers: { 
        //             'Authorization': `Bearer ${token}`,
        //             'Content-Type': 'application/json'
        //         }
        //     });

        //     if (!response.ok) {
        //         throw new Error('Failed to fetch expenses');
        //     }

        //     const data = await response.json();

        const mockData = {
            expenses: [
                {
                    expense_id: 1,
                    expense_date: new Date().toISOString(),
                    category_name: 'Groceries',
                    amount: 50.75,
                    description: 'Weekly grocery shopping'
                },
                {
                    expense_id: 2,
                    expense_date: new Date().toISOString(),
                    category_name: 'Dining Out',
                    amount: 35.20,
                    description: 'Lunch with friends'
                }
            ],
            totalPages: 1,
            page: 1
        };

            setExpenses(mockData.expenses);
            setPagination(prev => ({
                ...prev,
                totalPages: mockData.totalPages
            }));
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Fetch expenses when component mounts or filters/pagination change
    useEffect(() => {
        fetchExpenses();
    }, [pagination.page, filters]);

    // Handle pagination
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Apply filters
    const applyFilters = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchExpenses();
    };

    // Render loading state
    if (loading) {
        return <div>Loading expenses...</div>;
    }

    // Render error state
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="expense-list">
            <div className="filters">
                {/* Category Filter */}
                <select 
                    name="categoryId" 
                    value={filters.categoryId} 
                    onChange={handleFilterChange}
                >
                    <option value="">All Categories</option>
                    {/* Populate with actual categories */}
                </select>

                {/* Date Range Filters */}
                <input 
                    type="date" 
                    name="startDate" 
                    value={filters.startDate} 
                    onChange={handleFilterChange}
                />
                <input 
                    type="date" 
                    name="endDate" 
                    value={filters.endDate} 
                    onChange={handleFilterChange}
                />

                <button onClick={applyFilters}>Apply Filters</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.expense_id}>
                            <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                            <td>{expense.category_name}</td>
                            <td>${expense.amount.toFixed(2)}</td>
                            <td>{expense.description}</td>
                            <td>
                                <button>Edit</button>
                                <button>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                        key={page} 
                        onClick={() => handlePageChange(page)}
                        disabled={page === pagination.page}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ExpenseList;