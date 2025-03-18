CBSistema

 - Introduction

CBSistema is a stock and inventory management system designed to track products, movements, and generate administrative reports. This guide will walk you through setting up and running the project using both an automated script and manual methods.
user: "admin"
password: "pwd123"

 - Quick Start (Recommended Method)

To streamline the startup process, a shell script (start.sh) has been provided. This script will:
Install dependencies for both backend and frontend if they are missing.
Start the backend server.
Start the frontend React application.
Ensure the MySQL database is running.

Step 1: Grant Execution Permission (One Time Only)

Before running the script, ensure it has execution permissions:

chmod +x start.sh

Step 2: Run the Startup Script

Execute the script to start both backend and frontend:

./start.sh

This will handle all necessary setup and launch the application automatically.

 - Manual Startup (Alternative Method in case .sh fails)

If you prefer to start the backend and frontend separately, follow these steps.

Step 1: Start the Backend

Open a terminal and navigate to the backend directory:
cd backend
Install dependencies (only needed the first time):
npm install
Start the backend server:
npm start

Note: Ensure that MySQL is running before starting the backend.

Step 2: Start the Frontend

Open a new terminal and navigate to the frontend directory:
cd frontend
Install dependencies (only needed the first time):
npm install
Start the React application:
npm start

This will launch the frontend interface in your default browser.

- Database Setup

To ensure the system functions correctly, MySQL must be running, and the database must be set up. Restore the database backup:

mysql -u root -p < backup.sql

This command will prompt you for the MySQL root password and import the necessary database structure and data.

-  Environment Variables

!!Certain environment variables need to be configured for the backend to run properly. Create a .env file inside the backend directory and specify the following:

DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=cbsistema
PORT=3000

Adjust these values according to your MySQL setup.

- Final Notes

Ensure MySQL is running before starting the backend.

If you encounter permission issues, use sudo to run commands.

The start.sh script is the recommended method for quickly setting up the project.

For any additional issues, check the logs in the terminal and verify your database connection settings.
