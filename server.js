const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
app.use(bodyParser.json());

// PostgreSQL configuration
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "expenseTrackerDB",
    password: "noah3000",
    port: 5433,
});

// Secret key for JWT
const SECRET_KEY = "your_jwt_secret_key";

// Mock user data for authentication
const users = [
    { id: "user1", name: "John Doe", password: "password123" },
    { id: "user2", name: "Jane Smith", password: "password456" },
];

// Test database connection
pool.connect((err) => {
    if (err) {
        console.error("Connection error", err.stack);
    } else {
        console.log("Connected to PostgreSQL");
    }
});

// Default route
app.get("/", (req, res) => {
    res.send("Server is running");
});

// -------------------------
// Authentication Endpoints
// -------------------------

// Signin endpoint
app.post("/signin", (req, res) => {
    const { user_id, password } = req.body;
    const user = users.find((u) => u.id === user_id && u.password === password);

    if (!user) {
        return res.status(401).json({ message: "Invalid User ID or Password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ user_id: user.id, name: user.name }, SECRET_KEY, {
        expiresIn: "1h",
    });

    res.json({ token, name: user.name });
});

// Middleware for verifying JWT
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Authentication required" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user; // Attach user info to request object
        next();
    });
};

// -------------------------
// Categories API Endpoints
// -------------------------

// Create a new category (authenticated)
app.post("/categories", authenticate, async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Category name is required" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *",
            [name, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error creating category" });
    }
});

// Get all categories (authenticated)
app.get("/categories", authenticate, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error retrieving categories" });
    }
});

// Delete a category by ID (authenticated)
app.delete("/categories/:id", authenticate, async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
    }

    try {
        const result = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: "Category not found" });
        } else {
            res.status(200).json({ message: "Category deleted successfully", category: result.rows[0] });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error deleting category" });
    }
});

// -------------------------
// Expenses API Endpoints
// -------------------------

// Create a new expense (authenticated)
app.post("/expenses", authenticate, async (req, res) => {
    const { amount, category, date, description } = req.body;

    if (!amount || !category || !date) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO expenses (amount, category, date, description) VALUES ($1, $2, $3, $4) RETURNING *",
            [amount, category, date, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating expense" });
    }
});

// Get all expenses (authenticated)
app.get("/expenses", authenticate, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM expenses ORDER BY date DESC");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error retrieving expenses" });
    }
});

// Update an expense by ID (authenticated)
app.put("/expenses/:id", authenticate, async (req, res) => {
    const { id } = req.params;
    const { amount, category, date, description } = req.body;

    try {
        const result = await pool.query(
            "UPDATE expenses SET amount = $1, category = $2, date = $3, description = $4 WHERE id = $5 RETURNING *",
            [amount, category, date, description, id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: "Expense not found" });
        } else {
            res.status(200).json(result.rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error updating expense" });
    }
});

// Delete an expense by ID (authenticated)
app.delete("/expenses/:id", authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("DELETE FROM expenses WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: "Expense not found" });
        } else {
            res.status(200).json({ message: "Expense deleted successfully" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error deleting expense" });
    }
});

// Start the server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
