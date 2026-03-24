const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./database/db'); 
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ORDER_IDEMPOTENCY_WINDOW_MS = 10 * 60 * 1000;
const processedOrderRequests = new Map();
const processingOrderRequests = new Set();

const cleanupProcessedOrderRequests = () => {
    const now = Date.now();
    for (const [key, value] of processedOrderRequests.entries()) {
        if (now - value.createdAt > ORDER_IDEMPOTENCY_WINDOW_MS) {
            processedOrderRequests.delete(key);
        }
    }
};

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
            WHERE p.is_active=true
            ORDER BY p.product_id ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("FETCH ERROR:", err.message);
        res.status(500).send('Server Error');
    }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access token is required" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        console.log("Authenticated User:", user);
        next();
    });
};

// --- USER AUTHENTICATION ROUTES ---

// 4. POLYMORPHIC SIGNUP
app.post('/api/signup', async (req, res) => {
    const client = await pool.connect();
    try {
      
        const { fullName, email, password, phone, role = 'user', address } = req.body;
        
        const validRoles = ['user', 'admin', 'seller', 'rider'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role specified." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await client.query('BEGIN');

      
        const personResult = await client.query(
            `INSERT INTO person (name, email, phone, role, password) VALUES ($1, $2, $3, $4, $5) RETURNING person_id, name, email, role`,
            [fullName, email, phone, role, hashedPassword]
        );
        
        const newPerson = personResult.rows[0];
        const pId = newPerson.person_id;



        if (role === 'user') {
            await client.query(`INSERT INTO "users" (user_id) VALUES ($1)`, [pId]);
        } else if (role === 'seller') {
            await client.query(`INSERT INTO seller (seller_id) VALUES ($1)`, [pId]);
        } else if (role === 'admin') {
            await client.query(`INSERT INTO admin (admin_id) VALUES ($1)`, [pId]);
        } else if (role === 'rider') {
            await client.query(`INSERT INTO rider (rider_id) VALUES ($1)`, [pId]);
        }
        const payload = {
            user_id: newPerson.person_id,
            role: newPerson.role
        };
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        let addressId = null;
        if (address) {
           
            let defaultAreaId = 1;
            const areaCheck = await client.query(`SELECT area_id FROM area LIMIT 1`);
            
            if (areaCheck.rows.length === 0) {
              
                const newArea = await client.query(
                    `INSERT INTO area (name, delivery_fee) VALUES ('Dhaka', 60) RETURNING area_id`
                );
                defaultAreaId = newArea.rows[0].area_id;
            } else {
                defaultAreaId = areaCheck.rows[0].area_id;
            }

            
            const addressResult = await client.query(
                `INSERT INTO address (street, area_id) VALUES ($1, $2) RETURNING address_id`,
                [address, defaultAreaId]
            );
            addressId = addressResult.rows[0].address_id;

           
            await client.query(
                `INSERT INTO person_address (person_id, address_id, label, is_default) VALUES ($1, $2, 'Home', TRUE)`,
                [pId, addressId]
            );
        }

        await client.query('COMMIT');
        
        res.status(201).json({ 
            message: `${role} registered successfully!`, 
            token: token,
            user: {
                user_id: pId,
                full_name: newPerson.name,
                email: newPerson.email,
                role: newPerson.role,
                address: address || null,
                address_id: addressId
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
app.post('/api/login',async (req, res) => {
    try {
        const { email, password } = req.body;


        const query = `
            SELECT 
                p.*, 
                a.address_id, 
                a.street, 
                a.city, 
                a.area_id
            FROM person p
            LEFT JOIN person_address pa ON p.person_id = pa.person_id AND pa.is_default = TRUE
            LEFT JOIN address a ON pa.address_id = a.address_id
            WHERE p.email = $1
        `;
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid Password" });
        }
       


        let formattedAddress = '';
        if (user.street) {
            formattedAddress = `${user.street}${user.city ? ', ' + user.city : ''}`;
        }

        const payload = {
            user_id: user.person_id,
            role: user.role
        };

        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.json({ 
            message: "Login successful", 
            token: accessToken,
            user: { 
                user_id: user.person_id, 
                full_name: user.name, 
                email: user.email, 
                role: user.role,
                address_id: user.address_id || null,     
                address: formattedAddress || null        
            } 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 6. PLACE ORDER (Transactional)
app.post('/api/orders', authenticateToken, async (req, res) => {
    const client = await pool.connect(); 
    const idempotencyKey = req.headers['x-idempotency-key'];

    if (idempotencyKey) {
        cleanupProcessedOrderRequests();

        const previousOrder = processedOrderRequests.get(idempotencyKey);
        if (previousOrder) {
            client.release();
            return res.status(200).json({
                message: "Order already placed successfully.",
                orderId: previousOrder.orderId,
                duplicate: true
            });
        }

        if (processingOrderRequests.has(idempotencyKey)) {
            client.release();
            return res.status(409).json({ error: "Order request is already being processed." });
        }

        processingOrderRequests.add(idempotencyKey);
    }
    
    try {
        const { customer, items, total, address_id } = req.body;

        const userId=req.user.user_id;
        
        await client.query('BEGIN');
        
        let finalAddressId = address_id;

      
        if (!finalAddressId) {
            const addressText = customer.address || 'Address not provided';
            const addressLabel = customer.label || 'Home'; 
            

            const lowerAddress = addressText.toLowerCase();
            const divisions = ['dhaka', 'chattogram', 'sylhet', 'khulna', 'rajshahi', 'barishal', 'rangpur', 'mymensingh'];
            
            let detectedArea = 'Dhaka'; 
            let i = 0;
            let foundMatch = false;

            for (let div of divisions) {
                if (lowerAddress.includes(div)) {
                    detectedArea = div.charAt(0).toUpperCase() + div.slice(1);
                    foundMatch = true;
                    break;
                }
                i++;
            }


            if (!foundMatch) {
                i = 0;
            }

            let finalAreaId;
            let money = (i === 0) ? 60 : i * 60; 
            let found_div = divisions[i];
            let city = found_div;

            const areaCheck = await client.query(`SELECT area_id FROM area WHERE name ILIKE $1 LIMIT 1`, [detectedArea]);
            
            if (areaCheck.rows.length === 0) {
                const newArea = await client.query(
                    `INSERT INTO area (name, delivery_fee) VALUES ($1,$2) RETURNING area_id`,
                    [detectedArea, money]
                );
                finalAreaId = newArea.rows[0].area_id;
            } else {
                finalAreaId = areaCheck.rows[0].area_id;
            }

            const newAddressResult = await client.query(
                `INSERT INTO address (street, area_id, city, division) VALUES ($1, $2, $3, $4) RETURNING address_id`,
                [addressText, finalAreaId, city, found_div]
            );
            finalAddressId = newAddressResult.rows[0].address_id;
            
            await client.query(
                `DELETE FROM person_address WHERE person_id = $1 AND label = $2`,
                [userId, addressLabel]
            );

            let insertingDefault=false;
            if(addressLabel=='Home')
            {
                insertingDefault=true;
            }
            await client.query(
                `INSERT INTO person_address (person_id, address_id, label, is_default) 
                 VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
                [userId, finalAddressId, addressLabel,insertingDefault]
            );
        }

        const query = `SELECT place_order($1, $2, $3, $4, $5::jsonb) AS new_order_id`;
        
        const result = await client.query(query, [
            userId, 
            finalAddressId, 
            total, 
            customer.paymentMethod, 
            JSON.stringify(items) 
        ]);
        
        const orderId = result.rows[0].new_order_id;

        if (idempotencyKey) {
            processedOrderRequests.set(idempotencyKey, {
                orderId,
                createdAt: Date.now()
            });
        }

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
        if (idempotencyKey) {
            processingOrderRequests.delete(idempotencyKey);
        }
        client.release();
    }
});

// --- SELLER DASHBOARD ROUTES ---

// 7. GET SELLER PRODUCTS
app.get('/api/seller/products/:seller_id',authenticateToken, async (req, res) => {
    try {
        const seller_id=req.user.user_id;

        if(req.user.role!=='seller') {
            return res.status(403).json({ error: "Access denied. Not a seller account." });
        }
        const query = `
            SELECT 
                product_id, 
                name, 
                unit_price as price, 
                stock as stock_quantity, 
                image_url,
                is_active    /* NEW: Send status to frontend */
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

// 8. ADD NEW PRODUCT

app.post('/api/products', authenticateToken, async (req, res) => {
    try {
        const { name, unit, price, stock_quantity, image_url, category_id } = req.body;
        const seller_id = req.user.user_id;

        if (req.user.role !== 'seller') {
            return res.status(403).json({ error: "Access denied. Not a seller account." });
        }

        const query = `
            INSERT INTO products (name, unit, unit_price, stock, image_url, category_id, seller_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING product_id
        `;
        
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
app.get('/api/seller/stats/:seller_id', authenticateToken, async (req, res) => {
    try {
        const seller_id = req.user.user_id;

        if (req.user.role !== 'seller') {
            return res.status(403).json({ error: "Access denied. Not a seller account." });
        }
        
        const prodQuery = `SELECT COUNT(*) FROM products WHERE seller_id = $1`;
        const prodResult = await pool.query(prodQuery, [seller_id]);
        
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

// 10. GET ALL CATEGORIES

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

// 11. DELETE (DEACTIVATE) PRODUCT

app.delete('/api/products/:id', authenticateToken, async (req, res) => { 
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ error: "Access denied." });
        }

        const { id } = req.params;
        const seller_id = req.user.user_id;

     
        const query = 'UPDATE products SET is_active = FALSE WHERE product_id = $1 AND seller_id = $2 RETURNING *';
        const result = await pool.query(query, [id, seller_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Product not found or unauthorized" });
        }

        res.json({ message: "Product deactivated successfully" });
    } catch (err) {
        console.error("DELETE PRODUCT ERROR:", err.message);
        res.status(500).send('Server Error');
    }
});

//cart logic database added

app.get('/api/cart',authenticateToken, async (req, res) => {
    try {
        const user_id=req.user.user_id;
        const query='SELECT * from cart_joiner($1)';
        const result = await pool.query(query, [user_id]);
        console.log("CART ITEMS:", result.rows);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Server Error');
        console.log(err.message);
    } finally {
        //client.release();
    }
});


app.post('/api/cart/add',authenticateToken, async (req, res) => {
    try{
        const user_id=req.user.user_id;
        const {product_id,quantity,price}=req.body;
        //either user has a cart or not 
        //has cart 
        const cartResult=await pool.query('SELECT cart_id from cart WHERE user_id=$1', [user_id]);
        let cart_id;
        if(cartResult.rows.length==0)
        {
            //no cart for this.
            //need to create 
            let newCart=await pool.query('INSERT INTO cart(user_id) values ($1) RETURNING cart_id',[user_id])
            cart_id=newCart.rows[0].cart_id;
        } 
        else 
        {
            cart_id=cartResult.rows[0].cart_id;
        }
        //now we have cart_id
        //check if product already in cart then just update qty
        const cartItemResult=await pool.query('SELECT * from cart_items WHERE cart_id=$1 AND product_id=$2',[cart_id,product_id]);
        if(cartItemResult.rows.length==0)
        {
            //not in cart, need to insert
            await pool.query('INSERT INTO cart_items(cart_id,product_id,quantity,price) VALUES($1,$2,$3,$4)',[cart_id,product_id,quantity,price]);
        }
        else
        {
            //already in cart, just update qty
            await pool.query('UPDATE cart_items SET quantity=quantity+$1 WHERE cart_id=$2 AND product_id=$3',[quantity,cart_id,product_id]);
        }
        res.json({message:"Product added to cart"});  
    }
    catch(err){
        res.status(500).send('Server Error');
    }
    finally {
        //client.release();
    }
});

//this is needed when we already have product and press plus or minus button
app.put('/api/cart/update', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { product_id, amount } = req.body; 

        const cartResult = await pool.query(`SELECT cart_id FROM cart WHERE user_id = $1 LIMIT 1`, [userId]);
        if (cartResult.rows.length === 0) return res.status(404).json({ error: "Cart not found" });
        const cartId = cartResult.rows[0].cart_id;

        const updateResult = await pool.query(`
            UPDATE cart_items 
            SET quantity = quantity + $1 
            WHERE cart_id = $2 AND product_id = $3 
            RETURNING quantity
        `, [amount, cartId, product_id]);

        if (updateResult.rows.length > 0 && updateResult.rows[0].quantity <= 0) {
            await pool.query(`DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`, [cartId, product_id]);
        }

        res.json({ message: "Cart quantity updated" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update cart" });
    }
});


app.delete('/api/cart/clear', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        await pool.query(`
            DELETE FROM cart_items 
            WHERE cart_id = (SELECT cart_id FROM cart WHERE user_id = $1 LIMIT 1)
        `, [userId]);
        res.json({ message: "Cart cleared" });
    } catch (err) {
        res.status(500).json({ error: "Failed to clear cart" });
    }
});

//user profile logic now

app.get('/api/profile/me',authenticateToken, async (req, res) => {
    try {
        const userId=req.user.user_id;
        const query='SELECT * from get_user_profile($1) AS profile';

        const result = await pool.query(query, [userId]);
        console.log("PROFILE DATA:", result.rows[0]);
        res.json(result.rows[0].profile);
    }     catch (err) {
        console.error("PROFILE FETCH ERROR:", err.message);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});


app.post('/api/profile/reviews', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { product_id, rating, comment } = req.body;
        console.log("REVIEW DATA:", { userId, product_id, rating, comment });
        const query='SELECT * from submit_review($1, $2, $3, $4)';

        await pool.query(query, [userId, product_id, rating, comment]);
        res.json({ message: "Review submitted successfully" });
    } catch (err) {
        console.error("REVIEW ERROR:", err.message);
        res.status(500).json({ error: "Failed to submit review" });
    }
});


app.put('/api/users/avatar', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { image_url } = req.body;

        await pool.query(`UPDATE person SET image_url = $1 WHERE person_id = $2`, [image_url, userId]);
        res.json({ message: "Avatar updated!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update avatar" });
        console.error("UPDATE AVATAR ERROR:", err.message);
    }
});



app.get('/api/rider/orders/available', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'rider') return res.status(403).json({ error: "Access denied." });

        const query = `
          SELECT * from get_rider_jobs() as available_orders
        `;
        const result = await pool.query(query);
        console.log("AVAILABLE ORDERS:", result.rows[0].available_orders);
        res.json(result.rows[0].available_orders);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch available orders" });
        console.error("FETCH RIDER ORDERS ERROR:", err.message);
    }
});

app.put('/api/rider/orders/:order_id/accept', authenticateToken, async (req, res) => {
    try {
        const riderId = req.user.user_id;
        const { order_id } = req.params;

        const query = `
            UPDATE orders 
            SET rider_id = $1, status = 'ontheway' 
            WHERE order_id = $2 AND rider_id IS NULL 
            RETURNING order_id;
        `;
        const result = await pool.query(query, [riderId, order_id]);

        if (result.rows.length === 0) {
            return res.status(409).json({ error: "Order was already claimed by another rider!" });
        }
        res.json({ message: "Order claimed successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to claim order" });
        console.error("ACCEPT ORDER ERROR:", err.message);
    }
});


app.get('/api/rider/orders/my-deliveries', authenticateToken, async (req, res) => {
    try {
        const riderId = req.user.user_id;
        const query = `
            SELECT o.order_id, o.status, a.street, p.name as customer_name, p.phone
            FROM orders o
            JOIN address a ON o.address_id = a.address_id
            JOIN person p ON o.user_id = p.person_id
            WHERE o.rider_id = $1 AND o.status = 'ontheway';
        `;
        const result = await pool.query(query, [riderId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch active jobs" });
    }
});

app.put('/api/rider/orders/:order_id/deliver', authenticateToken, async (req, res) => {
    try {
        const riderId = req.user.user_id;
        const { order_id } = req.params;

        const query = `
            UPDATE orders 
            SET status = 'delivered' 
            WHERE order_id = $1 AND rider_id = $2 
            RETURNING order_id;
        `;
        const orderId=await pool.query(query, [order_id, riderId]);
        if (orderId.rows.length === 0) {
            return res.status(404).json({ error: "Order not found or you are not assigned to this order." });
        }
        res.json({ message: "Delivery complete!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to mark delivered" });
        console.error("DELIVER ORDER ERROR:", err.message);
    }
});

app.get('/api/rider/profile', authenticateToken, async (req, res) => {
    try {
        const riderId = req.user.user_id;
        const query = `
            SELECT name, email, phone, image_url 
            FROM person
            WHERE person_id = $1
        `;
        const result = await pool.query(query, [riderId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Rider profile not found." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch rider profile" });
        console.error("FETCH RIDER PROFILE ERROR:", err.message);
    }
});

app.put('/api/rider/profileupdate', authenticateToken, async (req, res) => {
    try {
        const riderId = req.user.user_id;
        const { image_url } = req.body;
        await pool.query(`UPDATE person SET image_url = $1 WHERE person_id = $2`, [image_url, riderId]);
        res.json({ message: "Profile updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update profile" });
        console.error("UPDATE RIDER PROFILE ERROR:", err.message);
    }
});