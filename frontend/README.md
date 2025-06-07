# ILNB Finance Frontend

This project is built with React and Vite, providing a modern and efficient development experience.

## User Role Management

The application supports a role-based access control system with the following user roles (in hierarchical order):

1. **top_management** - Full administrative access
2. **business_head** - Business department leadership access
3. **rm_head** - Relationship Manager team lead access
4. **rm** - Basic Relationship Manager access (default for new users)

## Admin Access

A default admin account is automatically created when the backend server starts. Use these credentials to access the admin features:

- **Email:** admin@ilnbfinance.com
- **Password:** Admin@123

> Note: These credentials can be customized through environment variables in the backend. See the backend README for details.

## Role Management Features

### For Regular Users

- **Request Role Upgrade**: Users can request an upgrade to a higher role by providing justification
- **View Request Status**: Users can view the status of their role upgrade requests

### For Administrators (top_management)

- **User Management**: View all users and directly modify their roles
- **Role Request Management**: Review, approve, or reject role upgrade requests with comments

## Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Components

### Authentication

- **Login**: User authentication
- **Register**: New user registration (default role: rm)

### Dashboard

- **Overview**: Main dashboard view
- **User Management**: Admin interface for managing users
- **Role Request**: Interface for requesting role upgrades
- **Role Request Management**: Admin interface for managing role requests

### Role-Based Components

The application dynamically adjusts the available features based on the user's role:

- **Business Tracker**: Available to top_management, business_head, and rm_head
- **Investment Review**: Available to top_management and business_head
- **User Management**: Available to top_management only
- **Role Requests**: Available to top_management only

## Vite Features

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
