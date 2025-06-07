# ILNB Finance Backend

## Admin User Setup

The application automatically creates a default admin user on startup if one doesn't already exist. This ensures there's always an administrative account available for user management.

### Default Admin Credentials

- **Username:** admin
- **Email:** admin@ilnbfinance.com
- **Password:** Admin@123
- **Role:** top_management

### Customizing Admin Credentials

You can customize the admin credentials by setting the following environment variables in your `.env` file:

```
ADMIN_USERNAME=your_custom_username
ADMIN_EMAIL=your_custom_email@example.com
ADMIN_PASSWORD=your_secure_password
```

## User Role Management

The application supports the following user roles in hierarchical order (highest to lowest):

1. **top_management** - Full administrative access
2. **business_head** - Business department leadership access
3. **rm_head** - Relationship Manager team lead access
4. **rm** - Basic Relationship Manager access (default for new users)

### Role-Based Access Control

- New users are automatically assigned the 'rm' role during registration
- Users can request role upgrades through the application
- Only 'top_management' users can approve role upgrade requests
- Only 'top_management' users can directly modify user roles

## API Routes

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get authentication token
- `GET /api/auth/verify` - Verify authentication token

### User Management Routes (`/api/users`)

- `GET /api/users` - Get all users (top_management only)
- `PUT /api/users/:userId/role` - Update user role (top_management only)
- `POST /api/users/role-request` - Submit a role upgrade request
- `GET /api/users/role-requests` - Get all role requests (top_management only)
- `PUT /api/users/role-requests/:requestId` - Process a role request (top_management only)
- `GET /api/users/my-role-requests` - Get current user's role requests

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@ilnbfinance.com
ADMIN_PASSWORD=Admin@123
```

## Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. For development with auto-restart:
   ```
   npm run dev
   ```