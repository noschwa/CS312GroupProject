import React, { useState, useEffect } from 'react';

const ExpenseForm = ({ onSubmit, initialExpense = null }) => {
    const [formData, setFormData] = useState({
        categoryId: '',
        amount: '',
        description: '',
        expenseDate: ''
    });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);

    // Fetch categories when component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/categories', {
                    method: 'GET',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }

                const data = await response.json();
                setCategories(data);
            } catch (err) {
                setError(err.message);
            }
        };

        // Populate form if editing existing expense
        if (initialExpense) {
            setFormData({
                categoryId: initialExpense.category_id,
                amount: initialExpense.amount.toString(),
                description: initialExpense.description || '',
                expenseDate: initialExpense.expense_date.split('T')[0]
            });
        }

        fetchCategories();
    }, [initialExpense]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const endpoint = initialExpense 
                ? `/api/expenses/${initialExpense.expense_id}` 
                : '/api/expenses';
            
            const method = initialExpense ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save expense');
            }

            const savedExpense = await response.json();
            
            // Call parent component's onSubmit
            onSubmit(savedExpense);

            // Reset form
            setFormData({
                categoryId: '',
                amount: '',
                description: '',
                expenseDate: ''
            });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="expense-form-container">
            <form onSubmit={handleSubmit} className="expense-form">
                <h2>{initialExpense ? 'Edit Expense' : 'Add New Expense'}</h2>

                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="categoryId">Category</label>
                    <select
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                            <option 
                                key={category.category_id} 
                                value={category.category_id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="amount">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        min="0.01"
                        step="0.01"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="expenseDate">Date</label>
                    <input
                        type="date"
                        id="expenseDate"
                        name="expenseDate"
                        value={formData.expenseDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="submit-btn">
                    {initialExpense ? 'Update Expense' : 'Add Expense'}
                </button>
            </form>
        </div>
    );
};

export default ExpenseForm;