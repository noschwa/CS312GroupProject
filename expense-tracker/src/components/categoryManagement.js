import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './CategoryManagement.css'; // Import the CSS file for styling

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch categories from the API
    const fetchCategories = async () => {
        try {
            // const token = localStorage.getItem('token');
            const response = await fetch('/api/categories', {
                method: 'GET',
                headers: { 
                    // 'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setCategories(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setErrors("Failed to fetch categories.");
            setLoading(false);
        }
    };

    // Add a new category
    const addCategory = async () => {
        if (!newCategoryName.trim()) {
            setErrors("Category name cannot be empty.");
            return;
        }

        try {
            // const token = localStorage.getItem('token');
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    // 'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newCategory })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add category');
            }

            const addedCategory = await response.json();
            setCategories(prev => [...prev, addedCategory]);
            setNewCategory('');
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    if (loading) {
        return <div>Loading categories...</div>;
    }

    return (
        <div className="category-management">
            <h1>Category Management</h1>

            {/* Success and Error Messages */}
            {errors && <div className="error">{errors}</div>}
            {successMessage && <div className="success">{successMessage}</div>}

            {/* Add New Category */}
            <div className="add-category">
                <input
                    type="text"
                    placeholder="New Category Name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button onClick={addCategory}>Add Category</button>
            </div>

            {/* Category List */}
            <table className="category-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category) => (
                        <tr key={category.category_id}>
                            <td>
                                {editingCategory === category.category_id ? (
                                    <input
                                        type="text"
                                        defaultValue={category.name}
                                        onBlur={(e) =>
                                            editCategory(category.category_id, e.target.value)
                                        }
                                        autoFocus
                                    />
                                ) : (
                                    category.name
                                )}
                            </td>
                            <td>
                                {editingCategory !== category.category_id && (
                                    <>
                                        <button
                                            onClick={() => setEditingCategory(category.category_id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteCategory(category.category_id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryManagement;
