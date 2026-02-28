const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./database/db'); 

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

// 1. Home Route
app.get('/', (req, res) => {
    res.send('Welcome to ChaalDaal Backend (Chen Schema Version)');
});

// 2. GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.product_id as id,
                p.name,
                p.unit_price as price, 
                p.stock,
                p.unit,
                p.image_url as image,
                p.rating,
                c.name as category
            FROM products p 
            JOIN category c ON p.category_id = c.category_id 
            ORDER BY p.product_id ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("FETCH ERROR:", err.message);
        res.status(500).send('Server Error');
    }
});


// --- USER AUTHENTICATION ROUTES ---

// 4. POLYMORPHIC SIGNUP
app.post('/api/signup', async (req, res) => {
    const client = await pool.connect();
    try {
        // Default to 'user' if role isn't explicitly provided
        const { fullName, email, password, phone, role = 'user' } = req.body;
        
        // Validate the role against the DB constraint
        const validRoles = ['user', 'admin', 'seller', 'rider'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role specified." });
        }

        await client.query('BEGIN');

        // Step 1: Insert into Supertype (Person)
        const personResult = await client.query(
            `INSERT INTO person (name, email, phone, role, password) VALUES ($1, $2, $3, $4, $5) RETURNING person_id, name, email, role`,
            [fullName, email, phone, role, password]
        );
        
        const newPerson = personResult.rows[0];
        const pId = newPerson.person_id;

        // Step 2: Insert into Subtype based on role
        if (role === 'user') {
            await client.query(`INSERT INTO "users" (user_id) VALUES ($1)`, [pId]);
        } else if (role === 'seller') {
            // company_name can be updated later in the dashboard
            await client.query(`INSERT INTO seller (seller_id) VALUES ($1)`, [pId]);
        } else if (role === 'admin') {
            await client.query(`INSERT INTO admin (admin_id) VALUES ($1)`, [pId]);
        } else if (role === 'rider') {
            await client.query(`INSERT INTO rider (rider_id) VALUES ($1)`, [pId]);
        }

        await client.query('COMMIT');
        
        res.status(201).json({ 
            message: `${role} registered successfully!`, 
            user: {
                user_id: pId,
                full_name: newPerson.name,
                email: newPerson.email,
                role: newPerson.role
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("SIGNUP ERROR:", err.message);
        if (err.code === '23505') {
            return res.status(400).json({ error: "Email or Phone already exists" });
        }
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
});

// 5. LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const query = 'SELECT * FROM person WHERE email = $1';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = result.rows[0];

        if (password !== user.password) {
            return res.status(401).json({ error: "Invalid Password" });
        }

        // Keys mapping strictly to what the frontend expects
        res.json({ 
            message: "Login successful", 
            user: { 
                user_id: user.person_id, 
                full_name: user.name, 
                email: user.email, 
                role: user.role 
            } 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// 6. PLACE ORDER (Transactional)
app.post('/api/orders', async (req, res) => {
    const client = await pool.connect(); 
    
    try {
        const { customer, items, total, userId } = req.body;
        
        await client.query('BEGIN');

        // Step 1: Create the Order Record
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, status, order_time) 
             VALUES ($1, 'pending', NOW()) 
             RETURNING order_id`,
            [userId]
        );
        
        const orderId = orderResult.rows[0].order_id;

        // Step 2: Insert Order Details (Updated table and column names)
        for (const item of items) {
            await client.query(
                `INSERT INTO order_details (order_id, product_id, quantity, price) 
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.id, item.qty, item.price]
            );
        }

        // Step 3: Insert Payment Record
        await client.query(
            `INSERT INTO payment (order_id, amount, method, status, payment_time) 
             VALUES ($1, $2, $3, 'pending', NOW())`,
            [orderId, total, customer.paymentMethod]
        );

        await client.query('COMMIT');

        res.status(201).json({ 
            message: "Order placed successfully!", 
            orderId: orderId 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("ORDER TRANSACTION FAILED:", err.message);
        res.status(500).json({ error: "Transaction Failed: " + err.message });
    } finally {
        client.release();
    }
});

// --- SELLER DASHBOARD ROUTES ---

// 7. GET SELLER PRODUCTS
app.get('/api/seller/products/:seller_id', async (req, res) => {
    try {
        const { seller_id } = req.params;
        const query = `
            SELECT product_id, name, unit_price as price, stock as stock_quantity, image_url 
            FROM products 
            WHERE seller_id = $1 
            ORDER BY product_id DESC
        `;
        const result = await pool.query(query, [seller_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 8. ADD NEW PRODUCT (From Seller Dashboard)
app.post('/api/products', async (req, res) => {
    try {
        const { name, unit, price, stock_quantity, image_url, category_id, seller_id } = req.body;
        
        const query = `
            INSERT INTO products (name, unit, unit_price, stock, image_url, category_id, seller_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING product_id
        `;
        
        // Default unit to '1 pcs' if frontend doesn't supply it
        const result = await pool.query(query, [
            name, 
            unit || '1 pcs', 
            price, 
            stock_quantity, 
            image_url, 
            category_id, 
            seller_id
        ]);

        res.status(201).json({ message: "Product added", productId: result.rows[0].product_id });
    } catch (err) {
        console.error("ADD PRODUCT ERROR:", err.message);
        res.status(500).send('Server Error');
    }
});

// 9. GET SELLER STATS
app.get('/api/seller/stats/:seller_id', async (req, res) => {
    try {
        const { seller_id } = req.params;
        
        // Count total active products for this seller
        const prodQuery = `SELECT COUNT(*) FROM products WHERE seller_id = $1`;
        const prodResult = await pool.query(prodQuery, [seller_id]);
        
        // For a complete implementation, you'd join order_details to calculate total_sales and profit
        // This provides base values until order_details is fully populated
        res.json({
            total_products: parseInt(prodResult.rows[0].count),
            total_sales: 0, 
            total_profit: 0, 
            rating: 5.0 
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 10. GET ALL CATEGORIES (Add this near your other routes)
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT category_id, name FROM category ORDER BY category_id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});