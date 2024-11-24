require("dotenv").config();
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);
const express = require("express");
const { createCustomer, createRestaurant, fetchCustomer, fetchRestaurants, fetchReservation, createReservation, destroyReservation } = require("./db");
const app = express();

app.use(express.json());

// API endpoint to fetch all customers
app.get("/api/customers", async (req, res, next) => {
  try {
    const customers = await fetchCustomer();
    res.status(200).json(customers);
  } catch (error) {
    next(error);
  }
});

// API endpoint to fetch all restaurants
app.get("/api/restaurants", async (req, res, next) => {
  try {
    const restaurants = await fetchRestaurants();
    res.status(200).json(restaurants);
  } catch (error) {
    next(error);
  }
});

// API endpoint to fetch all reservations
app.get("/api/reservations", async (req, res, next) => {
  try {
    const reservations = await fetchReservation();
    res.status(200).json(reservations);
  } catch (error) {
    next(error);
  }
});

// API endpoint to create a reservation
app.post("/api/reservations", async (req, res, next) => {
  const { customer_id, restaurant_id, reservation_time, party_size } = req.body;
  try {
    const newReservation = await createReservation(customer_id, restaurant_id, reservation_time, party_size);
    res.status(201).json(newReservation);
  } catch (error) {
    next(error);
  }
});

// API endpoint to destroy a reservation
app.delete("/api/reservations/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    await destroyReservation(id);
    res.status(200).send(`Reservation with ID ${id} has been deleted`);
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res
    .status(err.status || 500)
    .send({ error: err.message ? err.message : err });
});

const init = async () => {
  await client.connect();
  console.log("connected to DB");
  const SQL = `
  DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS restaurant;

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL
);

CREATE TABLE restaurant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_size INTEGER NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    restaurant_id UUID REFERENCES restaurant(id) NOT NULL
);


  `;
  await client.query(SQL);
  console.log("Tables created");

const [larry, moe, curly, Marys, Johns, Joses] = await Promise.all([
  createCustomer("larry"),
  createCustomer("moe"),
  createCustomer("curly"),
  createRestaurant("Mary's"),
  createRestaurant("John's"),
  createRestaurant("Jose's"),
]);
};




const port = process.env.PORT || 5432;
    app.listen(port, () => console.log(`Listening on port ${port}`)
);

init();