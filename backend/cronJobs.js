import cron from 'node-cron';
import Attendance from './models/attendanceModel.js';
import User from './models/userModel.js';

const setupCronJobs = () => {
    // Schedule end-of-month login review on the 25th of each month at 2 AM
    cron.schedule('0 2 25 * *', async () => {
        console.log('Running end-of-month login review cron job...');
        try {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            // Find all out-of-range logins for the current month that haven't been regularized
            const outOfRangeLogins = await Attendance.find({
                isOutOfRange: true,
                regularized: false,
                date: {
                    $gte: new Date(currentYear, currentMonth, 1),
                    $lt: new Date(currentYear, currentMonth + 1, 1)
                }
            }).populate('user', 'username email');

            if (outOfRangeLogins.length > 0) {
                console.log(`Found ${outOfRangeLogins.length} out-of-range logins for review.`);
                // Here, you would typically send a notification to managers
                // For now, we'll just log them.
                outOfRangeLogins.forEach(login => {
                    console.log(`User: ${login.user.username}, Date: ${login.date.toISOString().split('T')[0]}, Location: (${login.loginLocation.latitude}, ${login.loginLocation.longitude})`);
                });
                // In a real application, you might send an email summary to top_management
                // or create a dashboard notification.
            } else {
                console.log('No out-of-range logins found for review this month.');
            }

        } catch (error) {
            console.error('Error during end-of-month login review cron job:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Or your desired timezone
    });

    console.log('Cron jobs scheduled.');
};

export default setupCronJobs;