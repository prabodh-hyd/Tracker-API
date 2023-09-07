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

/**
 * @swagger
 * tags:
 *  name: Users
 * description: User management
 */

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

/**
 * @swagger
 * /mytime/users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       description: User data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 created_at:
 *                   type: integer
 *                 updated_at:
 *                   type: integer
 *                 status:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: An error occurred while adding the user.
 */



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


/**
 * @swagger
 * /mytime/users/{uid}:
 *   put:
 *     summary: Update a user's name
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       description: New user data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 updated_at:
 *                   type: integer
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: An error occurred while updating the user.
 */

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

/**
 * @swagger
 * /mytime/users:
 *     get:
 *       summary: Get all users
 *       tags: 
 *        - Users
 *       responses:
 *         '200':
 *           description: A list of users
 *           content:
 *             application/json:
 *               example:
 *                 - uid: 1
 *                   name: test user
 *                 - uid: 2
 *                   name: test user1
 *         '500':
 *           description: Internal server error
 *           content:
 *             application/json:
 *               example:
 *                 error: An error occurred while getting the users.
 */

module.exports = router;
