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
 *  name: Tasks
 * description: Task management
 */

// Add a task
router.post('/', async (req, res) => {
  const { uid, task_name, task_description} = req.body;
  const createdAtTimestamp = Math.floor(Date.now() / 1000);
  const updatedAtTimestamp = createdAtTimestamp;
  const status = 'OPEN';

  try {
    const result = await client.query('INSERT INTO tasks (uid, task_name, task_description, created_at, updated_at, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [uid, task_name, task_description, createdAtTimestamp, updatedAtTimestamp, status]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ error: 'An error occurred while adding the task.' });
  }
});

/**
 * @swagger
 * /mytime/tasks:
 *   post:
 *     summary: Add a new task
 *     tags:
 *       - Tasks
 *     requestBody:
 *       description: Task data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: integer
 *               task_name:
 *                 type: string
 *               task_description:
 *                 type: string
 *             example:
 *               uid: 1
 *               task_name: Example Task
 *               task_description: This is an example task.
 *     responses:
 *       200:
 *         description: Task added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task_id:
 *                   type: integer
 *                 uid:
 *                   type: integer
 *                 task_name:
 *                   type: string
 *                 task_description:
 *                   type: string
 *                 created_at:
 *                   type: integer
 *                 updated_at:
 *                   type: integer
 *                 status:
 *                   type: string
 *             example:
 *               task_id: 1
 *               uid: 1
 *               task_name: Example Task
 *               task_description: This is an example task.
 *               created_at: 1677843540
 *               updated_at: 1677843540
 *               status: OPEN
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
 *               error: An error occurred while adding the task.
 */

// Update task's name and description
router.put('/:taskid', async (req, res) => {
  const { taskid } = req.params;
  const { task_name, task_description, status } = req.body;
  const updatedAtTimestamp = Math.floor(Date.now() / 1000);

  try {
    const result = await client.query('UPDATE tasks SET task_name = $1, task_description = $2, updated_at = $3, status = $4 WHERE taskid = $5 RETURNING *', [task_name, task_description, updatedAtTimestamp, status ,taskid]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'An error occurred while updating the task.' });
  }
});

/**
 * @swagger
 * /mytime/tasks/{taskid}:
 *   put:
 *     summary: Update a task
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: taskid
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       description: Updated task data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task_name:
 *                 type: string
 *               task_description:
 *                 type: string
 *               status:
 *                 type: string
 *             example:
 *               task_name: Updated Task
 *               task_description: This is an updated task.
 *               status: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task_id:
 *                   type: integer
 *                 task_name:
 *                   type: string
 *                 task_description:
 *                   type: string
 *                 updated_at:
 *                   type: integer
 *                 status:
 *                   type: string
 *             example:
 *               task_id: 1
 *               task_name: Updated Task
 *               task_description: This is an updated task.
 *               updated_at: 1677843540
 *               status: IN_PROGRESS
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
 *               error: An error occurred while updating the task.
 */


// Get tasks for a user
router.get('/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const result = await client.query('SELECT taskid, task_name, task_description, status FROM tasks WHERE uid = $1', [uid]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'An error occurred while getting the tasks.' });
  }
});

/**
 * @swagger
 * /mytime/tasks/{uid}:
 *   get:
 *     summary: Get tasks for a specific user
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of tasks for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   taskid:
 *                     type: integer
 *                   task_name:
 *                     type: string
 *                   task_description:
 *                     type: string
 *                   status:
 *                     type: string
 *                 example:
 *                   - taskid: 1
 *                     task_name: Task 1
 *                     task_description: Description for Task 1
 *                     status: OPEN
 *                   - taskid: 2
 *                     task_name: Task 2
 *                     task_description: Description for Task 2
 *                     status: IN_PROGRESS
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
 *               error: An error occurred while getting the tasks.
 */




module.exports = router;
