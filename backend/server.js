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

// 4. USER SIGNUP
app.post('/api/signup', async (req, res) => {
    const client = await pool.connect();
    try {
        const { fullName, email, password, phone } = req.body;
        
        await client.query('BEGIN');

        // Insert into Person
        const personResult = await client.query(
            `INSERT INTO person (name, email, phone, role, password) VALUES ($1, $2, $3, 'user', $4) RETURNING person_id, name, email, role`,
            [fullName, email, phone, password]
        );
        
        const newPerson = personResult.rows[0];

        // Insert into Users
        await client.query(
            `INSERT INTO "users" (user_id) VALUES ($1)`,
            [newPerson.person_id]
        );

        await client.query('COMMIT');
        
        res.status(201).json({ 
            message: "User registered!", 
            user: {
                id: newPerson.person_id,
                name: newPerson.name,
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

// 5. USER LOGIN
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

        res.json({ 
            message: "Login successful", 
            user: { 
                id: user.person_id, 
                name: user.name, 
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