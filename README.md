# 🚗 FastFahr - German Car Marketplace 🇩🇪

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PHP Version](https://img.shields.io/badge/PHP-%3E%3D8.1-8892BF.svg)](https://www.php.net/)
[![React Version](https://img.shields.io/badge/React-%5E18.0-61DAFB.svg)](https://reactjs.org/)
[![MySQL / MariaDB](https://img.shields.io/badge/Database-MySQL%20%7C%20MariaDB-00758F.svg)](https://mariadb.org/)

<p align="center">
  <img src="assets/logo.png" alt="FastFahr Logo" width="150"/>
</p>


## 👋 About The Project

FastFahr is a dynamic web application designed as a niche marketplace specifically for buying and selling German automobiles (like BMW, Mercedes-Benz, Audi, Porsche, VW). It features a modern React frontend interacting with a robust PHP backend. The backend is structured using an MVC-like approach (Models, Views handled by React, Controllers) to ensure separation of concerns for database interactions, business logic, and request handling, enabling features like listing creation, image uploads, browsing, bookmarking, and messaging.

## 🎬 Demonstration

Check out a brief video walkthrough of FastFahr's features and user interface:

[![FastFahr Demo Video](https://img.youtube.com/vi/YOUR_VIDEO_ID_HERE/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID_HERE)


## ✨ Key Features

*   **🚗 Browse Listings:** View all available German car listings with key details and thumbnail images.
*   **🔍 Filter & Search:** Filter listings based on various criteria (make, model, price range, etc.) and search by keywords.
*   **➕ Create Listings:** Authenticated users can create detailed car listings, including:
    *   Multiple photo uploads (up to 7).
    *   Selection of a main thumbnail image.
    *   Detailed vehicle specifications (Make, Model, Year, Mileage, Features, etc.).
    *   Location details (Province, City).
*   **✏️ Edit & Delete Listings:** Users can manage their own listings, updating details or removing them entirely. (Note: Current edit process requires re-uploading all photos).
*   **👤 User Authentication:** Secure user registration and login system using password hashing (`PASSWORD_DEFAULT`). Includes session management and password reset functionality via email verification codes.
*   **🖼️ Profile Management:** Users can update their username, email, password, and upload/change their profile picture. Default avatars display the user's first initial if no picture is uploaded.
*   **⭐ Bookmarking:** Logged-in users can save (bookmark) listings they are interested in for easy access later.
*   **💬 Messaging System:** Enables direct user-to-user communication within the platform. Features include:
    *   Viewing conversation lists.
    *   Near real-time message updates via client-side polling.
    *   Starting new conversations by searching for users.
    *   Deleting entire chat histories.

## 🛠️ Tech Stack

*   **Frontend:**
    *   [React.js](https://reactjs.org/) (v18+) - Core UI library
    *   [React Router](https://reactrouter.com/) - Client-side routing
    *   CSS (Component-specific modules) - Styling
*   **Backend:**
    *   [PHP](https://www.php.net/) (v8.1+) - Server-side logic
    *   [PHPMailer](https://github.com/PHPMailer/PHPMailer) - Sending emails (Password Resets)
    *   [phpdotenv](https://github.com/vlucas/phpdotenv) - Environment variable management
*   **Database:**
    *   [MySQL](https://www.mysql.com/) / [MariaDB](https://mariadb.org/) - Relational database storage
*   **Web Server:**
    *   [Apache](https://httpd.apache.org/) (typically via XAMPP for local dev)
*   **Development Environment:**
    *   [XAMPP](https://www.apachefriends.org/) - Local development stack (Apache, MySQL, PHP)
    *   [Node.js / npm](https://nodejs.org/) - Frontend dependency management and build process
    *   [Composer](https://getcomposer.org/) - Backend dependency management
    *   [Git](https://git-scm.com/downloads) - Version control

## 🚀 Getting Started / How To Run

Follow these instructions to get a local copy up and running for development or testing.

**Prerequisites:**

1.  **XAMPP (or similar stack):** Ensure you have Apache, MySQL/MariaDB, and PHP (v8.1+) installed and running. [Download XAMPP](https://www.apachefriends.org/index.html)
2.  **Composer:** PHP dependency manager. [Install Composer](https://getcomposer.org/download/)
3.  **Node.js & npm:** JavaScript runtime and package manager (v16+ recommended). [Download Node.js](https://nodejs.org/)
4.  **Git:** For cloning the repository. [Download Git](https://git-scm.com/downloads)

**Setup Instructions:**

1.  **Clone Repository:**
    ```bash
    git clone https://github.com/ArkelZiko/fast-fahr.git
    cd fastfahr
    ```

2.  **Backend Setup:**
    *   `cd backend`
    *   `composer install`
    *   Copy `.env.example` to `.env` (if `.env.example` exists, otherwise create `.env`).
    *   **Edit `backend/.env`** with your database credentials (host, name, user, password), mailer credentials (Gmail email and **App Password**), mail port (465), and frontend URL for CORS (`CORS_ORIGIN=http://localhost` for React dev server).

3.  **Database Setup:**
    *   Start MySQL via XAMPP Control Panel.
    *   Open phpMyAdmin (`http://localhost/phpmyadmin`).
    *   Create a new database (e.g., `fastfahr_db`) with `utf8mb4_general_ci` collation.
    *   Import all provided `.sql` table structure files (`users.sql`, `posts.sql`, etc.) into the `fastfahr_db` database. Ensure correct import order respecting foreign keys (e.g., `users` first).
    *   **Run SQL for Indexes:** Execute the `ALTER TABLE` commands (provided previously or in a separate `indexes.sql` file) in phpMyAdmin's SQL tab to add performance indexes.

4.  **Frontend Setup:**
    *   `cd ../frontend`
    *   `npm install`
    *   Copy `.env.example` to `.env` (if exists, otherwise create `.env`).
    *   **Edit `frontend/.env`:**
        *   Set `REACT_APP_API_BASE=http://localhost/fastfahr/backend/apis` (URL to your backend API files).
        *   Set `REACT_APP_STATIC_BASE=http://localhost/fastfahr` (Base URL for accessing static files like uploaded images).

5.  **Deployment to XAMPP (`htdocs`):**
    *   Ensure Apache's `DocumentRoot` in its configuration points to your main `htdocs` folder (e.g., `C:/xampp/htdocs`).
    *   Create `htdocs/fastfahr/`.
    *   **Build Frontend:** In the `frontend` directory, run: `npm run build`
    *   **Copy Files:**
        *   Copy the **entire `backend` folder** into `htdocs/fastfahr/`.
        *   Copy the **entire `uploads` folder** into `htdocs/fastfahr/`.
        *   Copy the **contents of `frontend/build`** into `htdocs/fastfahr/`.
    *   Your `htdocs/fastfahr` should now contain `index.html`, `static/`, `backend/`, `uploads/`, etc.

6.  **Folder Permissions:**
    *   The web server (Apache in XAMPP) needs **write access** to `htdocs/fastfahr/uploads` and its subdirectories (`profile_pictures`) (i.e chmod 777).

7.  **Run:**
    *   Start **Apache** and **MySQL** in the XAMPP Control Panel.
    *   Navigate to `http://localhost/fastfahr/` in your browser.

## 📂 Project Structure (Simplified)

fastfahr/ (Project Root)
├── backend/
│ ├── app/
│ │ ├── controllers/
│ │ └── models/
│ ├── apis/
│ ├── config/
│ ├── vendor/
│ └── .env
├── frontend/
│ ├── public/ (Favicon, manifest.json, index.html template)
│ ├── src/ (React source code - components, pages, hooks, etc.)
│ ├── build/ (Output of 'npm run build' - CONTENT copied to htdocs)
│ └── .env
├── uploads/ (User uploaded files - Needs write permission)
│ └── profile_pictures/
├── .gitignore
├── composer.json
├── package.json
└── README.md (This file)

## 🔮 Future Improvements

*   **🚀 Real-time Messaging:** Revamp messages system to use WebSockets (ideally via Ratchet) instead of polling for instant message delivery.
*   **🖼️ Enhanced Image Editing:** Improve the listing edit flow to allow managing existing photos (delete specific ones, add new ones) instead of requiring a full re-upload.
*   **🛡️ Rate Limiting:** Implement rate limiting on sensitive API endpoints (login, password reset, message sending) using a library or custom logic.
*   **🏗️ Backend Refactoring (Front Controller):** Implement a proper Front Controller pattern with a routing library (e.g., FastRoute) to centralize request handling, improve URL structure, and remove individual API files. Or move the project over to Laravel for a proper MVC build.
*   **📦 Data Transfer Objects (DTOs):** Utilize DTOs in the PHP backend for stronger typing and clearer data contracts between layers.
*   **📚 Documentation:** Add more comprehensive inline code comments (PHPDoc/JSDoc) and potentially API documentation (e.g., using Swagger/OpenAPI).
*   **🐛 Bug Fixes:** Address any remaining known bugs or edge cases identified during testing.
*   **📱 UI/UX Improvements:** Enhance overall UI consistency across pages, improve layout and usability on mobile devices, and refine user workflows.

## 💡 What We Learned

*   Integrating a React Single Page Application (SPA) with a traditional PHP backend API structure.
*   Managing application state effectively in React using Hooks (`useState`, `useEffect`, `useCallback`) and Context API (`useAuth`).
*   Handling file uploads securely in PHP and associating them with database records.
*   Debugging common web development issues involving CORS, path resolution (relative vs. absolute), asynchronous operations, and state synchronization between client and server.
*   The importance of error handling for a smooth user experience at all times
*   Implementing core web application features: CRUD for listings, user authentication 
(registration, login, password reset), user-to-user messaging (via polling), and bookmarking functionality.
*   The critical importance of database indexing for improving query performance.
*   Understanding the trade-offs and implementation differences between polling and WebSockets for real-time features.
*   Setting up and configuring a local development environment using XAMPP for a full-stack application.

## 📄 License

This project is licensed under the MIT License.

Copyright (c) 2024 [Your Name or Organization Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.