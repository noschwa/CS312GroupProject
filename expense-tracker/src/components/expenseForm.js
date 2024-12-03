import React, { useState, useEffect } from "react";
import axios from "axios";

const ExpenseForm = ({ onSubmit, initialExpense = null }) => {
    const [formData, setFormData] = useState({
        categoryId: "",
        amount: "",
        description: "",
        expenseDate: "",
    });
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState(null);

    // Fetch categories and populate form data if editing an expense
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("/api/categories", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCategories(response.data);
            } catch (err) {
                setError("Failed to fetch categories.");
            }
        };

        if (initialExpense) {
            setFormData({
                categoryId: initialExpense.category_id || "",
                amount: initialExpense.amount?.toString() || "",
                description: initialExpense.description || "",
                expenseDate: initialExpense.expense_date
                    ? initialExpense.expense_date.split("T")[0]
                    : "",
            });
        }

        fetchCategories();
    }, [initialExpense]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = "Please enter a valid amount.";
        }
        if (!formData.expenseDate) {
            newErrors.expenseDate = "Please select a date.";
        }
        if (!formData.description) {
            newErrors.description = "Description is required.";
        }
        if (!formData.categoryId) {
            newErrors.categoryId = "Please select a category.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setError(null);

        if (!validateForm()) return;

        try {
            const token = localStorage.getItem("token");
            const endpoint = initialExpense
                ? `/api/expenses/${initialExpense.expense_id}`
                : "/api/expenses";
            const method = initialExpense ? "PUT" : "POST";

            const response = await axios({
                method,
                url: endpoint,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                data: {
                    ...formData,
                    amount: parseFloat(formData.amount),
                },
            });

            const savedExpense = response.data;

            if (onSubmit) {
                onSubmit(savedExpense);
            }

            setFormData({
                categoryId: "",
                amount: "",
                description: "",
                expenseDate: "",
            });
            setSuccessMessage("Expense saved successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save expense.");
        }
    };

    return (
        <div className="expense-form-container">
            <form onSubmit={handleSubmit} className="expense-form">
                <h2>{initialExpense ? "Edit Expense" : "Add New Expense"}</h2>

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

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
                        {categories.map((category) => (
                            <option key={category.category_id} value={category.category_id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {errors.categoryId && <p className="error">{errors.categoryId}</p>}
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
                        placeholder="Enter amount"
                        required
                    />
                    {errors.amount && <p className="error">{errors.amount}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Enter description"
                    />
                    {errors.description && <p className="error">{errors.description}</p>}
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
                    {errors.expenseDate && <p className="error">{errors.expenseDate}</p>}
                </div>

                <button type="submit" className="submit-btn">
                    {initialExpense ? "Update Expense" : "Add Expense"}
                </b
