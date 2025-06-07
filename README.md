# ILNB Finance CRM

A comprehensive Customer Relationship Management (CRM) system for financial services with role-based access control.

## Features

- **User Authentication**: Secure login and registration system
- **Role-Based Access Control**: Four-tier role hierarchy with different permission levels
- **User Management**: Admin interface for managing users and roles
- **Role Request System**: Allow users to request role upgrades with approval workflow
- **Dashboard**: Customized views based on user roles
- **Client Management**: Track and manage client information
- **Lead Management**: Track potential clients and conversion pipeline
- **Task Management**: Assign and track tasks
- **Service Requests**: Handle client service requests
- **Business Tracker**: Analytics for management roles
- **Investment Review**: Investment performance tracking for higher management
- **Attendance Management**: Track employee attendance with geolocation verification
- **GPS Anti-Spoofing System**: Prevent location spoofing for attendance verification
- **Office Location Management**: Configure multiple office locations with custom ranges

## Project Structure

This project consists of two main components:

### Frontend

- Built with React and Vite
- Material UI for responsive design
- Role-based component rendering
- JWT authentication

### Backend

- Node.js with Express
- MongoDB database
- JWT authentication
- Role-based API access control
- Automatic admin user creation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   SECRET_KEY=your_jwt_secret_key
   ADMIN_USERNAME=admin
   ADMIN_EMAIL=admin@ilnbfinance.com
   ADMIN_PASSWORD=Admin@123
   ```

5. Start the backend server:
   ```
   cd backend
   npm start
   ```

6. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

## Admin Access

A default admin account is automatically created when the backend server starts:

- **Email:** admin@ilnbfinance.com
- **Password:** Admin@123

These credentials can be customized through environment variables in the backend.

## User Roles

The application supports the following user roles in hierarchical order (highest to lowest):

1. **top_management** - Full administrative access
2. **business_head** - Business department leadership access
3. **rm_head** - Relationship Manager team lead access
4. **rm** - Basic Relationship Manager access (default for new users)

## Attendance System Security

The attendance system uses multiple layers of security to prevent spoofing:

### GPS Anti-Spoofing System

The system implements several layers of protection:

1. **Speed-based detection**: Detects unrealistic movement speeds between consecutive location data points
2. **Accuracy-based detection**: Identifies suspicious GPS accuracy values (too perfect or too poor)
3. **Teleportation detection**: Checks for impossibly fast location changes within short time periods

### Office Location Management

Administrators can:

1. Configure multiple office locations with customizable parameters:
   - Office name and address
   - Precise GPS coordinates (latitude/longitude)
   - Custom radius for valid check-ins (in meters)

2. Test the anti-spoofing system with the built-in testing tool
   - Simulates location data for verification
   - Shows distance to nearest configured office
   - Validates against all anti-spoofing checks

### Hierarchical Access Control

The attendance system implements role-based access that follows company hierarchy:

- **Top Management**: Can view all attendance records
- **Business Heads**: Can view their teams and below
- **RM Heads**: Can only view RM records
- **RMs**: Can only view their own attendance

## License

This project is licensed under the MIT License - see the LICENSE file for details.