const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    // 1. Create the rider_review table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rider_review (
          review_id serial primary key,
          rating int check(rating >=1 and rating <=5),
          comment text,
          user_id int not null,
          rider_id int not null,
          is_active boolean default true,
          foreign key (user_id) references "users"(user_id) on delete cascade,
          foreign key (rider_id) references rider(rider_id) on delete cascade,
          CONSTRAINT unique_user_rider_review UNIQUE (user_id, rider_id)
      );
    `);

    // 2. Add UPSERT function for rider reviews
    await pool.query(`
      CREATE OR REPLACE FUNCTION submit_rider_review(v_userId int, v_riderId int, v_rating int, v_text varchar)
      RETURNS void AS $$
      BEGIN
        INSERT INTO rider_review (user_id, rider_id, rating, comment)
        VALUES (v_userId, v_riderId, v_rating, v_text)
        ON CONFLICT (user_id, rider_id) 
        DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, is_active = true;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 3. Create Trigger Function to calculate and update rider.rating average
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_rider_rating()
      RETURNS trigger AS $$
      BEGIN
        UPDATE rider SET
        rating = (
          SELECT COALESCE(AVG(rating), 0)
          FROM rider_review
          WHERE rider_id = NEW.rider_id AND is_active = true
        )
        WHERE rider_id = NEW.rider_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 4. Create the Trigger on rider_review
    await pool.query(`DROP TRIGGER IF EXISTS rider_rating_update_trig ON rider_review;`);
    await pool.query(`
      CREATE TRIGGER rider_rating_update_trig
      AFTER INSERT OR UPDATE OF rating, is_active 
      ON rider_review
      FOR EACH ROW EXECUTE FUNCTION update_rider_rating();
    `);

    console.log("Rider reviews database schema successfully updated!");
  } catch (err) {
    console.error("Database Error:", err);
  } finally {
    pool.end();
  }
}

run();
