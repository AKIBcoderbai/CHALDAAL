const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./database/db'); // Your Supabase connection

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---

// 1. Home Route (Test)
app.get('/', (req, res) => {
    res.send('Welcome to ChaalDaal Backend');
});

// 2. GET ALL PRODUCTS (The new part!)
// 2. GET ALL PRODUCTS (Updated with JOIN)
app.get('/api/products', async (req, res) => {
    try {
        // We join 'products' and 'categories' tables to get the category name
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            JOIN categories c ON p.category_id = c.category_id 
            ORDER BY p.product_id ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// 3. PLACE ORDER (The Complex Part)
app.post('/api/orders', async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { customer, items, total } = req.body;

        // Start Transaction
        await client.query('BEGIN');

        // A. Insert into ORDERS table
        const orderQuery = `
            INSERT INTO orders (customer_name, phone_number, address, total_amount, payment_method)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING order_id
        `;
        const orderValues = [customer.name, customer.phone, customer.address, total, customer.paymentMethod];
        const orderResult = await client.query(orderQuery, orderValues);
        const newOrderId = orderResult.rows[0].order_id;

        // B. Insert into ORDER_ITEMS table (Loop through cart)
        for (const item of items) {
            const itemQuery = `
                INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(itemQuery, [newOrderId, item.id, item.qty, item.price]);

            // Optional: Decrease Stock
            // await client.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2', [item.qty, item.id]);
        }

        // Commit Transaction (Save everything)
        await client.query('COMMIT');

        res.status(201).json({ message: 'Order Placed Successfully', orderId: newOrderId });

    } catch (err) {
        await client.query('ROLLBACK'); // If error, undo everything
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
});
// --- USER AUTHENTICATION ROUTES ---

// 4. USER SIGNUP
app.post('/api/signup', async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: "Email and Password are required" });
        }

        const query = `
            INSERT INTO users (full_name, email, password, phone)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, full_name, email, role
        `;
        const result = await pool.query(query, [fullName, email, password, phone]);
        
        res.status(201).json({ message: "User registered!", user: result.rows[0] });

    } catch (err) {
        // Postgres Error Code 23505 = Unique Violation
        if (err.code === '23505') {
            // Check WHICH constraint failed
            if (err.constraint === 'users_email_key') {
                return res.status(400).json({ error: "Email already exists" });
            } else if (err.constraint === 'unique_phone_number') {
                return res.status(400).json({ error: "Phone number already exists" });
            }
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 5. USER LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = result.rows[0];

        // Check password (Direct comparison for this university project level)
        // For advanced/production: Use 'bcrypt.compare(password, user.password)'
        if (password !== user.password) {
            return res.status(401).json({ error: "Invalid Password" });
        }

        // Success! Send back user info (exclude password)
        res.json({ 
            message: "Login successful", 
            user: { 
                id: user.user_id, 
                name: user.full_name, 
                email: user.email, 
                role: user.role 
            } 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//
