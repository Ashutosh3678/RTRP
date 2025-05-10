/**
 * Migration script to update existing users with the new schema changes
 * - Change 'user' roles to 'student'
 * - Ensure all users have the proper schema fields
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to the database
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ashutoshsingh2081:ashutoshsingh2081@rtrp.7sfxwhx.mongodb.net/?retryWrites=true&w=majority&appName=RTRP', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

const migrateUsers = async () => {
    try {
        // Find all users with old role 'user'
        const usersToMigrate = await User.find({ role: 'user' });
        console.log(`Found ${usersToMigrate.length} users with role 'user' to migrate to 'student'`);

        // Update role for all users that need migration
        for (const user of usersToMigrate) {
            user.role = 'student';
            await user.save();
            console.log(`Updated user ${user.username} to role 'student'`);
        }

        // Find all users without phone number field
        const usersWithoutPhone = await User.find({ phoneNumber: { $exists: false } });
        console.log(`Found ${usersWithoutPhone.length} users without phone number field`);

        // Add phoneNumber field to all users that need it
        for (const user of usersWithoutPhone) {
            user.phoneNumber = ''; // Empty string as placeholder
            await user.save();
            console.log(`Added empty phoneNumber field to user ${user.username}`);
        }

        // Find all users without OTP field
        const usersWithoutOTP = await User.find({ 'otp.code': { $exists: false } });
        console.log(`Found ${usersWithoutOTP.length} users without OTP fields`);

        // Add OTP fields to all users that need it
        for (const user of usersWithoutOTP) {
            user.otp = {
                code: null,
                expiresAt: null
            };
            await user.save();
            console.log(`Added OTP fields to user ${user.username}`);
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

// Run the migration
migrateUsers(); 