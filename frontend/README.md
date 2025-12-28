# Todo App with Authentication

A full-stack todo application with user authentication, built with React, Node.js, Express, and MySQL.

## 🎯 Features

- ✅ User registration and authentication
- ✅ JWT-based session management
- ✅ Create, read, update, and delete todos
- ✅ Mark todos as complete/incomplete
- ✅ Edit todo tasks inline
- ✅ Responsive design with Tailwind CSS
- ✅ Microservices architecture
- ✅ Docker containerization

## 🏗️ Architecture

The application consists of three microservices:

1. **Auth Service** (Port 3001) - Handles user registration, login, and token verification
2. **Todo Service** (Port 3002) - Manages CRUD operations for todos
3. **Frontend** (Port 80/3000) - React-based user interface

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo>
   cd ToDo-fixed
   ```

2. **Configure environment variables** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Build and run**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Auth API: http://localhost:3001
   - Todo API: http://localhost:3002

### Local Development (without Docker)

**Prerequisites:**
- Node.js 16+ and npm
- MySQL database

**Setup:**

1. **Install dependencies for each service**
   ```bash
   # Auth service
   cd auth-service
   npm install
   
   # Todo service
   cd ../todo-service
   npm install
   
   # Frontend
   cd ../frontend/tests
   npm install
   ```

2. **Configure environment variables**
   
   Create `.env` files in `auth-service/` and `todo-service/`:
   ```env
   PORT=3001
   DB_HOST=your-db-host
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=todo_app
   DB_PORT=3306
   JWT_SECRET=your-secret-key
   ```

3. **Setup database**
   ```bash
   mysql -u root -p < database/setup.sql
   ```

4. **Start services**
   
   In separate terminals:
   ```bash
   # Terminal 1 - Auth Service
   cd auth-service
   npm start
   
   # Terminal 2 - Todo Service
   cd todo-service
   npm start
   
   # Terminal 3 - Frontend
   cd frontend/tests
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000

## 📁 Project Structure

```
ToDo/
├── auth-service/          # Authentication microservice
│   ├── server.js          # Express server & API routes
│   ├── package.json
│   └── Dockerfile
├── todo-service/          # Todo management microservice
│   ├── server.js          # Express server & API routes
│   ├── package.json
│   └── Dockerfile
├── frontend/tests/        # React frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.svg
│   │   └── manifest.json
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── index.js       # Entry point
│   │   ├── index.css      # Global styles
│   │   └── services/
│   │       ├── AuthService.js    # Auth API client
│   │       └── TodoService.js    # Todo API client
│   ├── package.json
│   ├── tailwind.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── database/
│   └── setup.sql          # Database schema
├── docker-compose.yml     # Docker orchestration
├── .env.example           # Environment variables template
├── .gitignore
├── FIXES.md              # Detailed fixes documentation
└── README.md             # This file
```

## 🔌 API Endpoints

### Auth Service (Port 3001)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/verify` | Verify JWT token | Yes |

### Todo Service (Port 3002)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/todos` | Get all todos for user | Yes |
| POST | `/api/todos` | Create new todo | Yes |
| GET | `/api/todos/:id` | Get specific todo | Yes |
| PUT | `/api/todos/:id` | Update todo | Yes |
| DELETE | `/api/todos/:id` | Delete todo | Yes |

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Environment-based configuration
- CORS enabled for cross-origin requests
- Token verification for protected routes

## 🛠️ Technologies Used

### Frontend
- React 18
- Tailwind CSS
- Lucide React (icons)
- Fetch API for HTTP requests

### Backend
- Node.js
- Express.js
- MySQL
- JWT (jsonwebtoken)
- bcrypt for password hashing
- cors for cross-origin support

### DevOps
- Docker
- Docker Compose
- Nginx (for frontend serving)

## 🐛 Common Issues & Fixes

### Issue: Login fails with network error
**Solution:** Check if the typo `locahost` has been fixed to `localhost` in AuthService.js

### Issue: Favicon 404 error
**Solution:** Ensure `favicon.svg` exists in `frontend/tests/public/`

### Issue: Services can't connect
**Solution:** 
- For Docker: Use service names (e.g., `http://auth-service:3001`)
- For local dev: Use `localhost` with correct ports

### Issue: Database connection fails
**Solution:** Verify database credentials in environment variables

## 📝 Development Notes

### Testing the Application

1. **Create an account**
   - Click "Create Account"
   - Enter username and password
   - Should show success message

2. **Login**
   - Use your credentials
   - Should redirect to dashboard

3. **Manage todos**
   - Add new tasks
   - Toggle completion status
   - Edit task text
   - Delete tasks

### Code Style
- ES6+ syntax
- Async/await for asynchronous operations
- Functional components with hooks (React)
- RESTful API design

## 🚀 Production Deployment

**Important security steps before deploying:**

1. Change JWT secret to a strong random value
2. Use environment variables for all sensitive data
3. Enable HTTPS
4. Set up proper CORS origins
5. Add rate limiting
6. Implement request validation
7. Add logging and monitoring
8. Use secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Happy coding! 🎉**
