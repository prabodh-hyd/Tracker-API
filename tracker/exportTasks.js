const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

const express = require('express');
const app = express();
// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Database configuration
const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
};

const cors = require('cors');
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};
app.use(cors(corsOptions));


// Create a PostgreSQL client
const client = new Client(dbConfig);

let tempFileName; // Declare the variable here

async function exportTasksToCSV() {
    try {
        // Connect to the database
        await client.connect();

        // Query tasks and hours from the tables
        const queryResult = await client.query('SELECT t.taskid, t.task_name, tr.hours FROM tasks t JOIN task_tracker tr ON t.taskid = tr.taskid');

        // Convert the query result to a CSV string
        let csvContent = 'taskid,task_name,hours\n'; // CSV header
        for (const row of queryResult.rows) {
            csvContent += `${row.taskid},${row.task_name},${row.hours}\n`;
        }

        // Write the CSV content to a temporary file
        tempFileName = 'tasks.csv'; // Assign a value here
        fs.writeFileSync(tempFileName, csvContent);

        // Send the CSV file as an attachment using SendGrid
        const msg = {
            to: 'aditya@prabodh.in',
            from: 'support@prabodh.in',
            subject: 'Task Export',
            text: 'Attached is the CSV file containing tasks and hours.',
            attachments: [
                {
                    content: fs.readFileSync(tempFileName).toString('base64'),
                    filename: 'tasks.csv',
                    type: 'application/csv',
                    disposition: 'attachment',
                },
            ],
        };

        // Send the email
        await sgMail.send(msg);

        console.log('Email sent with CSV attachment');
    } catch (error) {
        console.error('Error exporting tasks and sending email:', error);
    } finally {
        // Close the database connection
        await client.end();

        // Delete the temporary CSV file if it exists
        if (tempFileName) {
            fs.unlinkSync(tempFileName);
        }
    }
}

// Call the function to export tasks and send the email
exportTasksToCSV();
