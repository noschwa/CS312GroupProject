import React, { useEffect, useState } from "react";
import axios from "axios";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:3000/categories", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(response.data);
        } catch (error) {
            console.error(error);
            alert(error.response?.data.message || "Failed to fetch categories");
        }
    };

    const addCategory = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:3000/categories",
                { name: newCategory },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewCategory("");
            fetchCategories();
        } catch (error) {
            console.error(error);
            alert(error.response?.data.message || "Failed to add category");
        }
    };

    const deleteCategory = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:3000/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchCategories();
        } catch (error) {
            console.error(error);
            alert(error.response?.data.message || "Failed to delete category");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div>
            <h1>Categories</h1>
            <input
                type="text"
                placeholder="New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
            />
            <button onClick={addCategory}>Add Category</button>
            <ul>
                {categories.map((category) => (
                    <li key={category.id}>
                        {category.name}{" "}
                        <button onClick={() => deleteCategory(category.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Categories;
