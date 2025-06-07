import cron from 'node-cron';
import Attendance from './models/attendanceModel.js';
import User from './models/userModel.js';

const setupCronJobs = () => {
    // Schedule end-of-month login review on the 25th of each month at 2 AM
    cron.schedule('0 2 25 * *', async () => {
        console.log('Running end-of-month login review cron job...');
        try {
            // Use Asia/Kolkata timezone consistently
            const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
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

            // Find all late logins for the current month that haven't been reviewed
            const lateLogins = await Attendance.find({
                isLate: true,
                managerReviewed: false,
                date: {
                    $gte: new Date(currentYear, currentMonth, 1),
                    $lt: new Date(currentYear, currentMonth + 1, 1)
                }
            }).populate('user', 'username email');
            
            if (outOfRangeLogins.length > 0 || lateLogins.length > 0) {
                console.log(`Found ${outOfRangeLogins.length} out-of-range logins and ${lateLogins.length} late logins for review.`);
                
                // Log out-of-range logins
                outOfRangeLogins.forEach(login => {
                    console.log(`Out of Range - User: ${login.user.username}, Date: ${login.date.toISOString().split('T')[0]}, Location: (${login.loginLocation.latitude}, ${login.loginLocation.longitude})`);
                });
                
                // Log late logins
                lateLogins.forEach(login => {
                    console.log(`Late Login - User: ${login.user.username}, Date: ${login.date.toISOString().split('T')[0]}, Late by: ${login.lateMinutes} minutes`);
                });
                
                // In a real application, you would send an email summary to managers
                // or create a dashboard notification.
            } else {
                console.log('No out-of-range or late logins found for review this month.');
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