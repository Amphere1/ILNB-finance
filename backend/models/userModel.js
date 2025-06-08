import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: [true, "name is required"],
        unique: true,
        trim: true,
        lowercase: true
    },
    email:{
        type: String,
        required: [true, "email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password:{
        type: String,
        required: [true, "password is required"],
        minLength: [6, "password must be atleast 6 characters long"]
    },    role: {
        type: String,
        enum: ['top_management', 'business_head', 'rm_head', 'rm'],
        default: 'rm',
        required: [true, "User role is required"]
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional - will be set when a manager is assigned
    },
    department: {
        type: String,
        default: 'General',
        trim: true
    },
    CreatedAt:{
        type: Date,
        default: Date.now
    },    UpdatedAt:{
        type: Date,
        default: Date.now
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true // Add an index to improve query performance
    },
    designation: {
        type:String,
        required: [true, "designation is required"]
    },
    department: {
        type:String,
        required: [true, "department is required"]
    },
    dateOfJoining:{
        type: Date,
        required: [true, "date of joining is required"]
    },
    location:{
        type:String,
        required: [true,"location is required"]
    }
});



const User = mongoose.model('User', userSchema);

export default User;