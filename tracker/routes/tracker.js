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

// add task_tracker entry when a user starts working on a task

router.post('/', async (req, res) => {
    const { taskid } = req.body;
    const createdAtTimestamp = Math.floor(Date.now() / 1000);
    const updatedAtTimestamp = createdAtTimestamp;
    const hours = 0;

    try {
        const result = await client.query('INSERT INTO task_tracker(taskid, hours, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING *', [taskid, hours, createdAtTimestamp, updatedAtTimestamp]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error adding tracker:', error);
        res.status(500).json({ error: 'An error occurred while adding the tracker.' });
    }
});

// update tracker hours when a user updates a tracker
router.put('/update/:tracker_id', async (req, res) => {
    const { tracker_id } = req.params;
    const updatedAtTimestamp = Math.floor(Date.now() / 1000);

    try {
        const result = await client.query('UPDATE task_tracker SET updated_at = $1 WHERE tracker_id = $2 RETURNING *', [updatedAtTimestamp, tracker_id]);
        // calculate hours
        const result2 = await client.query('SELECT * FROM task_tracker WHERE tracker_id = $1', [tracker_id]);
        const tracker = result2.rows[0];
        const createdAtTimestamp = tracker.created_at;
        const hours = Math.floor((updatedAtTimestamp - createdAtTimestamp) / 3600);
        // update hours
        const result3 = await client.query('UPDATE task_tracker SET hours = $1 WHERE tracker_id = $2 RETURNING *', [hours, tracker_id]);
        res.json(result3.rows[0]);
    } catch (error) {
        console.error('Error updating tracker:', error);
        res.status(500).json({ error: 'An error occurred while updating the tracker.' });
    }
});

// get all trackers for a task
router.get('/:taskid', async (req, res) => {
    const { taskid } = req.params;

    try {
        const result = await client.query('SELECT * FROM task_tracker WHERE taskid = $1', [taskid]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting trackers:', error);
        res.status(500).json({ error: 'An error occurred while getting the trackers.' });
    }
});

// get all trackers 
router.get('/', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM task_tracker');
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting trackers:', error);
        res.status(500).json({ error: 'An error occurred while getting the trackers.' });
    }
});



module.exports = router;
