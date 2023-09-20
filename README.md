# My Wallet Backend - Node.js and Nest.js Application

## Description
"My Wallet Backend" is a Node.js and Nest.js application designed to complement the "My Wallet" frontend application for financial management. This backend application focuses on providing REST API endpoints for managing financial data, utilizing a PostgreSQL database for data storage, and integrating Auth0 for user authorization. The project aims to enhance my knowledge of Node.js, Nest.js, PostgreSQL, and Auth0. Please note that this project is in its early stages of development and may have limited functionality.
## Technologies
"My Wallet Backend" application leverages the following technologies and tools:

* Node.js: A JavaScript runtime environment.
* Nest.js: A progressive Node.js framework for building efficient and scalable server-side applications.
* PostgreSQL: An open-source relational database.
* Auth0: An authentication and authorization platform.
* REST API: A set of endpoints for accessing financial data.
## Features
At this stage, "My Wallet Backend" offers the following features:

* User authentication and authorization using Auth0.
* CRUD (Create, Read, Update, Delete) operations for financial data (user accounts).
* Secure access control to financial data based on user roles and permissions.
* Integration with PostgreSQL for data storage.
* REST API endpoints for interacting with financial data.

## Installation

To set up and run the "My Wallet Backend" application on your local environment, follow these steps:
1. Clone the repository:

```
git clone https://github.com/Sosna213/MyWalletApi.git
```
2. Navigate to the project directory:
```
cd my-wallet-api
```
3. Install dependencies:
```
npm install
```
4. Configure environment variables:
  * Create a .env file and add your Auth0 and database connection details.
5. Start the application:

```
npm start 
```
The backend server will start, and the API will be accessible  at `http://localhost:6060`.

## API Endpoints
* POST /api/account: Create user financial account
* GET /api/account/user-accounts: Get all financial accounts for user
* DELETE /api/account/:id: Delete user financial account

## Status
The "My Wallet Backend" project is in its early stages of development. New features and enhancements will be added as development progresses.

Thank you for using our backend application!
