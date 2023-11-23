const express = require('express');
const router = express.Router();
const { Client } = require('pg');
require('dotenv').config();

// const cron = require('node-cron');

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

// Add a task using username
router.post('/', async (req, res) => {
  const { username, task_name, task_description } = req.body;
  const createdAtTimestamp = Math.floor(Date.now() / 1000);
  const updatedAtTimestamp = createdAtTimestamp;
  const status = 'OPEN';

  try {
    // Retrieve the user ID based on the username
    const userQuery = await client.query('SELECT uid FROM users WHERE name = $1', [username]);

    // Check if the username exists
    if (userQuery.rows.length === 0) {
      res.status(404).json({ error: 'Username not found.' });
      return;
    }

    const uid = userQuery.rows[0].uid;

    // Insert the task with the retrieved user ID
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
 *               username:
 *                 type: string
 *               task_name:
 *                 type: string
 *               task_description:
 *                 type: string
 *             example:
 *               username: JohnDoe
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
 *       404:
 *         description: Username not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: Username not found.
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

// Update Task name, description and status
router.put('/:taskid', async (req, res) => {
  const { taskid } = req.params;
  const { task_name, task_description, status } = req.body;
  const allowedStatusValues = ['OPEN', 'IN_PROGRESS', 'PAUSED', 'STALE', 'CLOSED', 'DELETED'];

  // Validate status field
  if (!allowedStatusValues.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Allowed values: IN_PROGRESS, PAUSE, STALE, CLOSED, OPEN, DELETED.' });
  }

  const updatedAtTimestamp = Math.floor(Date.now() / 1000);

  try {
    const result = await client.query('UPDATE tasks SET task_name = $1, task_description = $2, updated_at = $3, status = $4 WHERE taskid = $5 RETURNING *', [task_name, task_description, updatedAtTimestamp, status, taskid]);
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
 *                 enum:
 *                   - IN_PROGRESS
 *                   - PAUSED
 *                   - STALE
 *                   - CLOSED
 *                   - OPEN
 *                   - DELETED
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

// get all tasks
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT taskid, task_name, task_description, status FROM tasks ORDER BY taskid ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'An error occurred while getting the tasks.' });
  }
});

/**
 * @swagger
 * /mytime/tasks:
 *   get:
 *     summary: Retrieve a list of tasks
 *     tags:
 *       - Tasks
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of tasks
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
 *                     status: CLOSED
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

// Get tasks for a user by username
router.get('/tasks/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // Assuming the 'name' column stores the username in the Users Table
    const result = await client.query(
      'SELECT t.taskid, t.task_name, t.task_description, t.status FROM tasks t ' +
      'INNER JOIN users u ON t.uid = u.uid ' +
      'WHERE u.name = $1 ORDER BY t.taskid ASC',
      [username]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'An error occurred while getting the tasks.' });
  }
});

/**
 * @swagger
 * /mytime/tasks/{username}:
 *   get:
 *     summary: Get tasks for a specific user by username
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: User's username
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

// Update task status
router.put('/:taskid/update-status', async (req, res) => {
  const { taskid } = req.params;
  const { status } = req.body;
  const updatedAtTimestamp = Math.floor(Date.now() / 1000);

  try {
    const result = await client.query('UPDATE tasks SET updated_at = $1, status = $2 WHERE taskid = $3 RETURNING *', [updatedAtTimestamp, status, taskid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating task to ${status} status:`, error);
    res.status(500).json({ error: `An error occurred while updating the task status to ${status}.` });
  }
});

/**
 * @swagger
 * /mytime/tasks/{taskid}/update-status:
 *   put:
 *     summary: Update a task status
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
 *       description: Request body to update the task status
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *             example:
 *               status: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Task status updated successfully
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
 *               task_name: Task 1
 *               task_description: Description for Task 1
 *               updated_at: 1677843540
 *               status: IN_PROGRESS
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: Task not found.
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
 *               error: An error occurred while updating the task status.
 */

// Delete a task by task ID
router.delete('/:taskid', async (req, res) => {
  const { taskid } = req.params;

  try {
      // Check if the task exists
      const taskResult = await client.query('SELECT * FROM tasks WHERE taskid = $1', [taskid]);
      if (taskResult.rows.length === 0) {
          return res.status(404).json({ error: 'Task not found.' });
      }

      // Delete the task
      await client.query('DELETE FROM tasks WHERE taskid = $1', [taskid]);

      res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'An error occurred while deleting the task.' });
  }
});

/**
 * @swagger
 * /mytime/tasks/{taskid}:
 *   delete:
 *     summary: Delete a task by task ID
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: taskid
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID to delete
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Task deleted successfully.
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: Task not found.
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
 *               error: An error occurred while deleting the task.
 */



module.exports = router;
