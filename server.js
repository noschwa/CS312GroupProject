const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const router = express.Router();

// PostgreSQL Connection Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Registration Route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id',
            [username, email, hashedPassword]
        );

        // Create default categories for the user
        const defaultCategories = await pool.query(
            'SELECT category_id FROM categories WHERE is_default = true'
        );

        const userId = result.rows[0].user_id;
        const categoryInserts = defaultCategories.rows.map(category => 
            pool.query(
                'INSERT INTO categories (user_id, name, is_default) VALUES ($1, (SELECT name FROM categories WHERE category_id = $2), true)',
                [userId, category.category_id]
            )
        );
        await Promise.all(categoryInserts);

        // Generate JWT
        const token = jwt.sign(
            { userId: result.rows[0].user_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(201).json({ token, userId: result.rows[0].user_id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.user_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({ token, userId: user.user_id });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Create Expense
router.post('/', authMiddleware, async (req, res) => {
    const { categoryId, amount, description, expenseDate } = req.body;
    const userId = req.user.userId;

    try {
        const result = await pool.query(
            `INSERT INTO expenses 
            (user_id, category_id, amount, description, expense_date) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [userId, categoryId, amount, description, expenseDate]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ error: 'Error creating expense' });
    }
});

// Read Expenses (with pagination and filtering)
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const { 
        page = 1, 
        limit = 10, 
        categoryId, 
        startDate, 
        endDate,
        sortBy = 'expense_date',
        sortOrder = 'DESC'
    } = req.query;

    try {
        // Base query with dynamic filtering
        let query = `
            SELECT e.*, c.name as category_name 
            FROM expenses e
            JOIN categories c ON e.category_id = c.category_id
            WHERE e.user_id = $1
        `;
        const queryParams = [userId];
        let paramIndex = 2;

        // Add category filter
        if (categoryId) {
            query += ` AND e.category_id = $${paramIndex}`;
            queryParams.push(categoryId);
            paramIndex++;
        }

        // Add date range filter
        if (startDate && endDate) {
            query += ` AND e.expense_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            queryParams.push(startDate, endDate);
            paramIndex += 2;
        }

        // Add sorting
        query += ` ORDER BY e.${sortBy} ${sortOrder}`;

        // Add pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);

        // Execute query
        const result = await pool.query(query, queryParams);

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM expenses 
            WHERE user_id = $1
            ${categoryId ? 'AND category_id = $2' : ''}
            ${startDate && endDate ? 'AND expense_date BETWEEN $' + (categoryId ? 3 : 2) + ' AND $' + (categoryId ? 4 : 3) : ''}
        `;
        const countParams = categoryId || (startDate && endDate) 
            ? [userId, ...(categoryId ? [categoryId] : []), ...(startDate && endDate ? [startDate, endDate] : [])]
            : [userId];
        
        const totalResult = await pool.query(countQuery, countParams);
        const total = parseInt(totalResult.rows[0].total);

        res.json({
            expenses: result.rows,
            totalExpenses: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Read expenses error:', error);
        res.status(500).json({ error: 'Error fetching expenses' });
    }
});

// Update Expense
router.put('/:expenseId', authMiddleware, async (req, res) => {
    const { expenseId } = req.params;
    const userId = req.user.userId;
    const { categoryId, amount, description, expenseDate } = req.body;

    try {
        const result = await pool.query(
            `UPDATE expenses 
            SET category_id = $1, 
                amount = $2, 
                description = $3, 
                expense_date = $4 
            WHERE expense_id = $5 AND user_id = $6
            RETURNING *`,
            [categoryId, amount, description, expenseDate, expenseId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ error: 'Error updating expense' });
    }
});

// Delete Expense
router.delete('/:expenseId', authMiddleware, async (req, res) => {
    const { expenseId } = req.params;
    const userId = req.user.userId;

    try {
        const result = await pool.query(
            'DELETE FROM expenses WHERE expense_id = $1 AND user_id = $2 RETURNING *',
            [expenseId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found or unauthorized' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ error: 'Error deleting expense' });
    }
});

// Monthly Summary
router.get('/summary', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const { month, year } = req.query;

    try {
        const summaryQuery = `
            SELECT 
                c.name AS category,
                COALESCE(SUM(e.amount), 0) AS total_amount,
                COALESCE(COUNT(e.expense_id), 0) AS transaction_count
            FROM categories c
            LEFT JOIN expenses e ON c.category_id = e.category_id 
                AND e.user_id = $1
                AND EXTRACT(MONTH FROM e.expense_date) = $2
                AND EXTRACT(YEAR FROM e.expense_date) = $3
            WHERE c.user_id = $1 OR c.is_default = true
            GROUP BY c.category_id, c.name
            ORDER BY total_amount DESC
        `;

        const result = await pool.query(summaryQuery, [
            userId, 
            month || new Date().getMonth() + 1, 
            year || new Date().getFullYear()
        ]);

        const totalExpenses = result.rows.reduce((sum, category) => sum + parseFloat(category.total_amount), 0);

        res.json({
            categories: result.rows,
            totalExpenses
        });
    } catch (error) {
        console.error('Monthly summary error:', error);
        res.status(500).json({ error: 'Error generating monthly summary' });
    }
});

// Get Categories (User's custom + default)
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.userId;

    try {
        const query = `
            SELECT category_id, name 
            FROM categories 
            WHERE user_id = $1 OR is_default = true 
            ORDER BY is_default, name
        `;

        const result = await pool.query(query, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Fetch categories error:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
});

// Create Custom Category
router.post('/', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const { name } = req.body;

    try {
        // Check if category already exists for this user
        const existingCheck = await pool.query(
            'SELECT * FROM categories WHERE user_id = $1 AND LOWER(name) = LOWER($2)',
            [userId, name]
        );

        if (existingCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        // Insert new category
        const result = await pool.query(
            'INSERT INTO categories (user_id, name, is_default) VALUES ($1, $2, false) RETURNING *',
            [userId, name]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Error creating category' });
    }
});


module.exports = router;

// Logout Route (client-side: remove token)
router.post('/logout', authMiddleware, (req, res) => {
    res.json({ message: 'Logout successful' });
});

module.exports = { router, authMiddleware };