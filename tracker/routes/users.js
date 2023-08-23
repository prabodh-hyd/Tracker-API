const express = require('express');
const router = express.Router();
const { Client } = require('pg');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
};

const client = new Client(dbConfig);
client.connect();

// Add a user
router.post('/', async (req, res) => {
  const { name } = req.body;
  const createdAtTimestamp = Math.floor(Date.now() / 1000);
  const updatedAtTimestamp = createdAtTimestamp;
  const status = 'ACTIVE';

  try {
    const result = await client.query('INSERT INTO users (name, created_at, updated_at, status) VALUES ($1, $2, $3, $4) RETURNING *', [name, createdAtTimestamp, updatedAtTimestamp, status]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'An error occurred while adding the user.' });
  }
});

// Update user's name
router.put('/:uid', async (req, res) => {
  const { uid } = req.params;
  const { name } = req.body;
  const updatedAtTimestamp = Math.floor(Date.now() / 1000);
  
  try {
    const result = await client.query('UPDATE users SET name = $1, updated_at = $2 WHERE uid = $3 RETURNING *', [name, updatedAtTimestamp, uid]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating the user.' });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT uid, name FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'An error occurred while getting the users.' });
  }
});


module.exports = router;
