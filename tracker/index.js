const express = require('express');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
};
const client = new Client(dbConfig);

const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const trackerRoutes = require('./routes/tracker');

client.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch(err => {
    console.error('Error connecting to the database', err);
  });

app.use(express.json());
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);
app.use('/tracker', trackerRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
