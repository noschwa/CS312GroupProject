const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(bodyParser.json());

// Configure PostgreSQL connection
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "expenseTrackerDB",
    password: "noah3000",
    port: 5433,
});

// Test the connection
pool.connect((err) => {
    if (err) {
        console.error("Connection error", err.stack);
    } else {
        console.log("Connected to PostgreSQL");
    }
});

app.get("/", (req, res) => {
    res.send("Server is running");
});



app.post("/expenses", (req, res) => {
    try {
        const { amount, category, date, description } = req.body;
        if (!amount || !category || !date) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        res.status(201).json({ message: "Expense added successfully", expense: req.body });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});


app.get("/expenses", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM expenses ORDER BY date DESC");
        res.status(200).json(result.rows); // Return all expenses
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving expenses");
    }
});

app.put("/expenses/:id", async (req, res) => {
    const { id } = req.params;
    const { amount, category, date, description } = req.body;

    try {
        const result = await pool.query(
            "UPDATE expenses SET amount = $1, category = $2, date = $3, description = $4 WHERE id = $5 RETURNING *",
            [amount, category, date, description, id]
        );

        if (result.rows.length === 0) {
            res.status(404).send("Expense not found");
        } else {
            res.status(200).json(result.rows[0]); // Return updated expense
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating expense");
    }
});


app.delete("/expenses/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("DELETE FROM expenses WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            res.status(404).send("Expense not found");
        } else {
            res.status(200).json({ message: "Expense deleted successfully" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting expense");
    }
});

// Start the server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
