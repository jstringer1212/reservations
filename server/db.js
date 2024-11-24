require("dotenv").config();
const uuid = require('uuid');
const pg = require("pg");
const client = new pg.Client( process.env.DATABASE_URL)

client.connect().catch((err) => console.error("Database connection error:", err));

const createCustomer = async (name)=> {
  const SQL = `
    INSERT INTO customers (id, name) VALUES ($1, $2) RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createRestaurant = async (name)=> {
  const SQL = `
    INSERT INTO restaurant(id, name) VALUES($1, $2) RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
}; 


// Fetch customers
async function fetchCustomer() {
  const result = await client.query('SELECT * FROM customers');
  return result.rows;
}

// Fetch restaurants
async function fetchRestaurants() {
  const result = await client.query('SELECT * FROM restaurants');
  return result.rows;
}

// Fetch reservations
async function fetchReservation() {
  const result = await client.query('SELECT * FROM reservations');
  return result.rows;
}

// Create a new reservation
async function createReservation(customer_id, restaurant_id, reservation_time, party_size) {
  const id = uuid.v4();
  const query = `
    INSERT INTO reservations (id, customer_id, restaurant_id, reservation_time, party_size)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [id, customer_id, restaurant_id, reservation_time, party_size];
  const result = await client.query(query, values);
  return result.rows[0];
}

// Destroy a reservation
async function destroyReservation(id) {
  const query = 'DELETE FROM reservations WHERE id = $1';
  await client.query(query, [id]);
}

module.exports = {
  createCustomer,
  createRestaurant,
  fetchCustomer,
  fetchRestaurants,
  fetchReservation,
  createReservation,
  destroyReservation,
};
