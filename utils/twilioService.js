const twilio = require('twilio');

// Environment variables with fallbacks for development
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC_fake_sid_for_development';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'fake_auth_token_for_development';
const twilioNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || 
                      !process.env.TWILIO_ACCOUNT_SID || 
                      !process.env.TWILIO_AUTH_TOKEN ||
                      !process.env.TWILIO_PHONE_NUMBER;

// Create Twilio client
let client;
try {
    client = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
} catch (error) {
    console.error('Error initializing Twilio client:', error);
    console.log('Using development mode instead.');
}

// Function to generate random OTP
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};

// Function to send OTP via SMS
const sendOTP = async (phoneNumber, otp) => {
    try {
        // Always print the OTP in the console for debugging
        console.log(`[OTP for ${phoneNumber}]: ${otp}`);
        
        // Check if we are in development mode
        if (isDevelopment) {
            console.log('DEV MODE: Skipping actual SMS sending. The OTP is displayed above.');
            return {
                success: true,
                message: 'OTP logged in console (DEV MODE)',
                sid: 'dev-mode'
            };
        }

        // Send the message via Twilio
        if (!client) {
            console.error('Twilio client not initialized. Using development mode.');
            return {
                success: true,
                message: 'OTP logged in console (DEV MODE)',
                sid: 'dev-mode-fallback'
            };
        }

        console.log(`Sending real SMS to ${phoneNumber} via Twilio from ${twilioNumber}`);
        
        try {
            const message = await client.messages.create({
                body: `Your Projects verification code is: ${otp}. This code will expire in 10 minutes.`,
                from: twilioNumber,
                to: phoneNumber
            });

            console.log(`SMS sent successfully, SID: ${message.sid}`);
            
            return {
                success: true,
                message: 'OTP sent successfully to your device',
                sid: message.sid
            };
        } catch (twilioError) {
            console.error('Twilio API Error:', twilioError);
            
            // Provide a more specific error message based on Twilio error code
            let errorMessage = 'Failed to send OTP';
            
            if (twilioError.code === 21211) {
                errorMessage = 'Invalid phone number format. Please include the country code.';
            } else if (twilioError.code === 21608) {
                errorMessage = 'This number is not capable of receiving SMS messages.';
            } else if (twilioError.code === 21610) {
                errorMessage = 'This number is blocked from receiving messages.';
            } else if (twilioError.code === 21614) {
                errorMessage = 'This number is not verified with Twilio. Please contact support.';
            }
            
            return {
                success: false,
                message: errorMessage,
                error: twilioError
            };
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        return {
            success: false,
            message: error.message || 'Failed to send OTP',
            error
        };
    }
};

module.exports = {
    generateOTP,
    sendOTP
}; 