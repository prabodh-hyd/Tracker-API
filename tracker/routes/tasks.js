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

// Add a task
router.post('/', async (req, res) => {
  const { uid, task_name, task_description } = req.body;
  const createdAtTimestamp = Math.floor(Date.now() / 1000);

  try {
    const result = await client.query('INSERT INTO tasks (uid, task_name, task_description, created_at) VALUES ($1, $2, $3, $4) RETURNING *', [uid, task_name, task_description, createdAtTimestamp]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ error: 'An error occurred while adding the task.' });
  }
});

// Update task's name and description
router.put('/:taskid', async (req, res) => {
  const { taskid } = req.params;
  const { task_name, task_description } = req.body;
  const updatedAtTimestamp = Math.floor(Date.now() / 1000);

  try {
    const result = await client.query('UPDATE tasks SET task_name = $1, task_description = $2, updated_at = $3 WHERE taskid = $4 RETURNING *', [task_name, task_description, updatedAtTimestamp, taskid]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'An error occurred while updating the task.' });
  }
});

// Get tasks for a user
router.get('/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const result = await client.query('SELECT taskid, task_name, task_description FROM tasks WHERE uid = $1', [uid]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'An error occurred while getting the tasks.' });
  }
});

module.exports = router;
