🛡️ Identity and Access Management (IAM) System with SSO
A Node.js-based Identity and Access Management (IAM) system implementing user registration, login with JWT-based Single Sign-On (SSO), and role-based redirection to external applications. Designed as a modular and extensible demo project for authentication and authorization workflows.

🔑 Features
✅ User registration with role selection (Admin/User)
✅ Dynamic grant assignment based on role
✅ Secure login with JWT token generation
✅ Token-based session management using localStorage
✅ Role-based redirection:
Admin → http://localhost:3001/views/admin.html
User → http://localhost:3001/views/user.html
✅ Session detection to auto-redirect if a valid token exists
✅ JSON-based user storage for demo purposes
✅ Frontend built with vanilla HTML/CSS/JS

🧩 Project Structure
project-root/
│
├── iam-app/
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── views/
│   │       ├── login.html
│   │       └── register.html
│   ├── data/
│   │   └── users.json
│   ├── config.js
│   ├── server.js
├── teammanager-app/
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── views/
│   │       ├── admin.html        # Admin dashboard (e.g., manage users)
│   │       └── user.html         # User dashboard (e.g., submit hours)
│   ├── data/
│   │   └── timesheets.json
│   ├── config.js
│   ├── server.js
├── projectdashboard-app/
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── views/
│   │       ├── admin.html        # Admin dashboard (manage projects/tasks)
│   │       └── user.html         # User dashboard (view assigned tasks)
│   ├── data/
│   │   ├── projects.json
│   │   └── tasks.json
│   ├── config.js
│   ├── server.js
├── README.md
└── LICENSE

⚙️ Technologies Used
- Node.js + Express.js
- JSON Web Tokens (JWT)
- Vanilla JS (frontend)
- File-based storage (users.json)

🚀 Getting Started
Install dependencies:
```
npm install
```
Start the server:
```
npm start
```
Access the app:

Register: http://localhost:3000/views/register.html
Login: http://localhost:3000/views/login.html

Once user is logged in based on the role selected, redirection happens to TeamManager app.
- If admin is logged in, redirects it to : http://localhost:3001/views/admin.html
- If user is logged in, redirects it to : http://localhost:3001/views/user.html

📌 Notes
- This is a demo project and uses plaintext passwords for simplicity. Use hashing (e.g., bcrypt) and a proper database in production.
- Token expiration is set to 1 hour; extend or refresh as needed.
- The apps that consume this SSO (like TeamManager or ProjectBoard) should validate tokens accordingly.
