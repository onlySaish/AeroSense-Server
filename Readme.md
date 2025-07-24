# AeroSense Server

This repository contains the backend server for the AeroSense application. It's built with Node.js and Express, providing a robust RESTful API for user management, authentication, and other core functionalities.

## Features

*   **User Authentication**: Secure user registration with OTP email verification, standard login with email/password, and session management using JWT (Access and Refresh Tokens).
*   **Google OAuth 2.0**: Seamless user login and registration via Google accounts.
*   **Password Management**: Complete password lifecycle management including change password, forgot password, and secure password reset via email link.
*   **Profile Management**: APIs for users to fetch and update their account details, including their avatar.
*   **Cloudinary Integration**: Handles media uploads (like user avatars) efficiently by storing them on Cloudinary.
*   **Structured & Scalable**: Organized codebase with a clear separation of concerns (routes, controllers, models, middlewares) for easy maintenance and scalability.
*   **Custom Error Handling**: Centralized error handling middleware for consistent and informative error responses.

## Tech Stack

*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB with Mongoose ODM
*   **Authentication**: JSON Web Tokens (JWT), Bcrypt, `google-auth-library`
*   **File Uploads**: Multer for handling multipart/form-data
*   **Cloud Storage**: Cloudinary for media storage
*   **Email Service**: Nodemailer with Gmail for sending OTPs and password reset links
*   **Environment Management**: Dotenv

## Getting Started

### Prerequisites

*   Node.js (v18.x or later)
*   npm
*   MongoDB instance (local or cloud-based like MongoDB Atlas)
*   Cloudinary account
*   Google Cloud Platform project with OAuth 2.0 credentials
*   Gmail account with an "App Password"

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/onlysaish/aerosense-server.git
    cd aerosense-server
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the following variables. Replace the placeholder values with your actual credentials.

    ```env
    PORT=8000
    MONGODB_URI=your_mongodb_connection_string
    CORS_ORIGIN=http://localhost:3000

    # JWT Secrets
    ACCESS_TOKEN_SECRET=your_super_secret_access_token_key
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key
    REFRESH_TOKEN_EXPIRY=10d

    # Cloudinary Credentials
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET_KEY=your_cloudinary_api_secret

    # Nodemailer (Gmail) Credentials
    EMAIL_USER=your_gmail_address@gmail.com
    APP_PASS=your_gmail_app_password

    # Google OAuth Credentials
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

    # Frontend URL for password reset links
    FRONTEND_URL=http://localhost:3000
    ```

4.  **Run the development server:**
    The server will start on the port specified in your `.env` file (defaults to 8000).
    ```sh
    npm run dev
    ```

## API Endpoints

All endpoints are prefixed with `/api/v1/users`.

| Method | Endpoint                    | Description                                         | Secure |
| :----- | :-------------------------- | :-------------------------------------------------- | :----: |
| `POST` | `/send-otp`                 | Sends a verification OTP to the user's email.       |   No   |
| `POST` | `/verify-otp`               | Verifies the OTP sent to the user.                  |   No   |
| `POST` | `/register`                 | Registers a new user after OTP verification.        |   No   |
| `POST` | `/login`                    | Logs in a user with email/password.                 |   No   |
| `GET`  | `/google-auth`              | Handles Google OAuth callback and logs in/registers a user. |   No   |
| `POST` | `/forgot-password`          | Sends a password reset link to the user's email.    |   No   |
| `POST` | `/verify-token/:token`      | Verifies the password reset token from the email link. |   No   |
| `POST` | `/reset-password`           | Resets the user's password using a valid token.    |   No   |
| `POST` | `/refresh-token`            | Refreshes the access token using a valid refresh token. |   No   |
| `POST` | `/logout`                   | Logs out the user and clears tokens.                |  Yes   |
| `GET`  | `/check`                    | Checks if the current user is authenticated.        |  Yes   |
| `GET`  | `/currentUser`              | Fetches details of the currently logged-in user.    |  Yes   |
| `PATCH`| `/changePassword`           | Changes the password for the logged-in user.        |  Yes   |
| `PATCH`| `/updateAccountDetails`     | Updates the full name, email, and username.         |  Yes   |
| `PATCH`| `/updateAvatar`             | Updates the user's avatar.                          |  Yes   |

## Project Structure
```
aerosense-server/
├── public/                 # Static files, contains a temp folder for uploads
│   └── temp/
├── src/                    # Main source code
│   ├── DB/                 # Database connection logic
│   ├── controllers/        # Business logic and route handlers
│   ├── middlewares/        # Express middlewares (auth, error handling, multer)
│   ├── models/             # Mongoose data models/schemas
│   ├── routes/             # API route definitions
│   ├── utils/              # Utility functions and helper classes (ApiError, ApiResponse)
│   ├── app.js              # Express app configuration and middleware setup
│   ├── constants.js        # Project-wide constants
│   └── index.js            # Application entry point
├── .env                    # (Locally created) Environment variables
├── package.json            # Project dependencies and scripts
└── ...