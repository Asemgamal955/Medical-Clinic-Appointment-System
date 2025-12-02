const axios = require('axios');
require('dotenv').config();

// Brevo (Sendinblue) API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_NAME = process.env.SENDER_NAME || 'Medical Clinic';

/**
 * Send email via Brevo API
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email body
 */
const sendEmail = async (to, subject, htmlContent) => {
    try {
        if (!BREVO_API_KEY) {
            console.warn('⚠️  Brevo API key not configured. Email not sent.');
            return { success: false, message: 'Email service not configured' };
        }

        const response = await axios.post(
            BREVO_API_URL,
            {
                sender: {
                    name: SENDER_NAME,
                    email: SENDER_EMAIL
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: htmlContent
            },
            {
                headers: {
                    'accept': 'application/json',
                    'api-key': BREVO_API_KEY,
                    'content-type': 'application/json'
                }
            }
        );

        console.log('✅ Email sent successfully to:', to);
        return { success: true, messageId: response.data.messageId };

    } catch (error) {
        console.error('❌ Email sending failed:', error.response?.data || error.message);
        return { success: false, message: error.message };
    }
};

/**
 * Send appointment confirmation email
 */
const sendAppointmentConfirmation = async (patientEmail, patientName, doctorName, appointmentDate, appointmentTime) => {
    const subject = 'Appointment Confirmation - Medical Clinic';
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; }
                .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Appointment Confirmed ✓</h1>
                </div>
                <div class="content">
                    <p>Dear ${patientName},</p>
                    <p>Your appointment has been successfully scheduled.</p>
                    
                    <div class="details">
                        <h3>Appointment Details:</h3>
                        <p><strong>Doctor:</strong> ${doctorName}</p>
                        <p><strong>Date:</strong> ${appointmentDate}</p>
                        <p><strong>Time:</strong> ${appointmentTime}</p>
                    </div>
                    
                    <p>Please arrive 10 minutes before your appointment time.</p>
                    <p>If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; 2025 Medical Clinic. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(patientEmail, subject, htmlContent);
};

/**
 * Send appointment cancellation email
 */
const sendAppointmentCancellation = async (patientEmail, patientName, doctorName, appointmentDate, appointmentTime) => {
    const subject = 'Appointment Cancelled - Medical Clinic';
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; }
                .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f44336; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Appointment Cancelled</h1>
                </div>
                <div class="content">
                    <p>Dear ${patientName},</p>
                    <p>Your appointment has been cancelled.</p>
                    
                    <div class="details">
                        <h3>Cancelled Appointment Details:</h3>
                        <p><strong>Doctor:</strong> ${doctorName}</p>
                        <p><strong>Date:</strong> ${appointmentDate}</p>
                        <p><strong>Time:</strong> ${appointmentTime}</p>
                    </div>
                    
                    <p>If you would like to schedule a new appointment, please contact us.</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; 2025 Medical Clinic. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(patientEmail, subject, htmlContent);
};

/**
 * Send appointment reminder email (for appointments tomorrow)
 */
const sendAppointmentReminder = async (patientEmail, patientName, doctorName, appointmentDate, appointmentTime) => {
    const subject = 'Appointment Reminder - Tomorrow';
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; }
                .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔔 Appointment Reminder</h1>
                </div>
                <div class="content">
                    <p>Dear ${patientName},</p>
                    <p><strong>This is a reminder that you have an appointment tomorrow.</strong></p>
                    
                    <div class="details">
                        <h3>Appointment Details:</h3>
                        <p><strong>Doctor:</strong> ${doctorName}</p>
                        <p><strong>Date:</strong> ${appointmentDate}</p>
                        <p><strong>Time:</strong> ${appointmentTime}</p>
                    </div>
                    
                    <p>Please arrive 10 minutes before your scheduled time.</p>
                    <p>We look forward to seeing you!</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; 2025 Medical Clinic. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(patientEmail, subject, htmlContent);
};

module.exports = {
    sendEmail,
    sendAppointmentConfirmation,
    sendAppointmentCancellation,
    sendAppointmentReminder
};
