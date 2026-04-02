const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    // 1. Ensure columns exist in the cart table just in case they were dropped
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cart' AND column_name='total_cost') THEN
          ALTER TABLE cart ADD COLUMN total_cost DECIMAL(10,2) DEFAULT 0.0;
        END IF;
      END $$;
    `);

    // 2. Create the Trigger Function to Synchronize Cart Items with Cart
    await pool.query(`
      CREATE OR REPLACE FUNCTION sync_cart_totals()
      RETURNS TRIGGER AS $func$
      BEGIN
          IF (TG_OP = 'DELETE') THEN
              -- Synchronize cart after an item is deleted
              UPDATE cart
              SET total_cost = (
                  SELECT COALESCE(SUM(quantity * price), 0)
                  FROM cart_items
                  WHERE cart_id = OLD.cart_id
              )
              WHERE cart_id = OLD.cart_id;
              
              -- Clean up empty carts automatically (User requested "removed from cart table")
              IF NOT EXISTS (SELECT 1 FROM cart_items WHERE cart_id = OLD.cart_id) THEN
                  DELETE FROM cart WHERE cart_id = OLD.cart_id;
              END IF;
              
              RETURN OLD;
          ELSE
              -- Synchronize cart after item is inserted/updated
              UPDATE cart
              SET total_cost = (
                  SELECT COALESCE(SUM(quantity * price), 0)
                  FROM cart_items
                  WHERE cart_id = NEW.cart_id
              )
              WHERE cart_id = NEW.cart_id;
              
              RETURN NEW;
          END IF;
      END;
      $func$ LANGUAGE plpgsql;
    `);

    // 3. Drop existing trigger if any and create it
    await pool.query(`DROP TRIGGER IF EXISTS cart_sync_trigger ON cart_items;`);
    await pool.query(`
      CREATE TRIGGER cart_sync_trigger
      AFTER INSERT OR UPDATE OR DELETE ON cart_items
      FOR EACH ROW EXECUTE FUNCTION sync_cart_totals();
    `);

    console.log("Database successfully updated with synchronization triggers!");
  } catch (err) {
    console.error("Database Error:", err);
  } finally {
    pool.end();
  }
}

run();
