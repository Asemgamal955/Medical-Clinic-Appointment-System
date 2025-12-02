/* manages process of appointments booking viewing updating and cancelling
It handles logic for patients doctors admins different roles have diff access levels */

const db = require('../config/database');
const { sendAppointmentConfirmation, sendAppointmentCancellation } = require('../utils/emailService');

// book new appointment (Patient only)
exports.createAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentDate, appointmentTime, notes } = req.body;
        const userId = req.user.userId;

        // validate input
        if (!doctorId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'please provide doctor, date, and time' 
            });
        }

        // Get patient_id from user_id
        const [patients] = await db.query('SELECT patient_id FROM Patient WHERE user_id = ?', [userId]);
        
        if (patients.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'patient record not found' 
            });
        }

        const patientId = patients[0].patient_id;

        // check for appointment conflicts (same doctor, same date/time)
        const [conflicts] = await db.query(
            'SELECT appointment_id FROM Appointment WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != "Cancelled"',
            [doctorId, appointmentDate, appointmentTime]
        );

        if (conflicts.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'this time slot is already booked. please choose another time.' 
            });
        }

        // create appointment
        const [result] = await db.query(
            'INSERT INTO Appointment (patient_id, doctor_id, appointment_date, appointment_time, notes) VALUES (?, ?, ?, ?, ?)',
            [patientId, doctorId, appointmentDate, appointmentTime, notes || null]
        );

        // get patient and doctor details for email
        const [patientInfo] = await db.query(
            'SELECT u.email, u.name FROM User u WHERE u.user_id = ?',
            [userId]
        );

        const [doctorInfo] = await db.query(
            'SELECT u.name FROM Doctor d JOIN User u ON d.user_id = u.user_id WHERE d.doctor_id = ?',
            [doctorId]
        );

        // Send confirmation email
        if (patientInfo.length > 0 && doctorInfo.length > 0) {
            await sendAppointmentConfirmation(
                patientInfo[0].email,
                patientInfo[0].name,
                doctorInfo[0].name,
                appointmentDate,
                appointmentTime
            );

            // Store notification in database
            await db.query(
                'INSERT INTO Notification (user_id, message, type) VALUES (?, ?, ?)',
                [userId, `Your appointment with ${doctorInfo[0].name} is confirmed for ${appointmentDate} at ${appointmentTime}`, 'Appointment']
            );
        }

        res.status(201).json({
            success: true,
            message: 'appointment created successfully and confirmation email sent',
            data: {
                appointmentId: result.insertId,
                patientId,
                doctorId,
                appointmentDate,
                appointmentTime,
                status: 'Scheduled'
            }
        });

    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'server error creating appointment' 
        });
    }
};

// get all appointments (role-based)
// list appointments but the results depend on who is asking.
exports.getAppointments = async (req, res) => {
    try {
        const userId = req.user.userId;
        // depending on role it builds different SQL query
        const userRole = req.user.role

        let query;
        let params;

        if (userRole === 'Patient') {
            // get patient appointments
            const [patients] = await db.query('SELECT patient_id FROM Patient WHERE user_id = ?', [userId]);
            const patientId = patients[0].patient_id;

            query = `
                SELECT 
                    a.appointment_id, a.appointment_date, a.appointment_time, a.status, a.notes,
                    u.name AS doctor_name, d.specialization
                FROM Appointment a
                JOIN Doctor d ON a.doctor_id = d.doctor_id
                JOIN User u ON d.user_id = u.user_id
                WHERE a.patient_id = ?
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
            `;
            params = [patientId];

        } else if (userRole === 'Doctor') {
            // get doctor's appointments
            const [doctors] = await db.query('SELECT doctor_id FROM Doctor WHERE user_id = ?', [userId]);
            const doctorId = doctors[0].doctor_id;

            query = `
                SELECT 
                    a.appointment_id, a.appointment_date, a.appointment_time, a.status, a.notes,
                    u.name AS patient_name, u.phone AS patient_phone
                FROM Appointment a
                JOIN Patient p ON a.patient_id = p.patient_id
                JOIN User u ON p.user_id = u.user_id
                WHERE a.doctor_id = ?
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
            `;
            params = [doctorId];

        } else if (userRole === 'Admin') {
            // get all appointments
            //  There is no WHERE filtering by id It asks for everything
            query = `
                SELECT 
                    a.appointment_id, a.appointment_date, a.appointment_time, a.status, a.notes,
                    up.name AS patient_name, ud.name AS doctor_name, d.specialization
                FROM Appointment a
                JOIN Patient p ON a.patient_id = p.patient_id
                JOIN User up ON p.user_id = up.user_id
                JOIN Doctor d ON a.doctor_id = d.doctor_id
                JOIN User ud ON d.user_id = ud.user_id
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
            `;
            params = [];
        }

        const [appointments] = await db.query(query, params);

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });

    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'server error fetching appointments' 
        });
    }
};

// Get single appointment by ID
exports.getAppointmentById = async (req, res) => {
    try {
        const appointmentId = req.params.id;

        const [appointments] = await db.query(
            `SELECT 
                a.appointment_id, a.appointment_date, a.appointment_time, a.status, a.notes, a.created_at,
                up.name AS patient_name, up.phone AS patient_phone, p.date_of_birth, p.medical_history,
                ud.name AS doctor_name, d.specialization, d.working_hours
            FROM Appointment a
            JOIN Patient p ON a.patient_id = p.patient_id
            JOIN User up ON p.user_id = up.user_id
            JOIN Doctor d ON a.doctor_id = d.doctor_id
            JOIN User ud ON d.user_id = ud.user_id
            WHERE a.appointment_id = ?`,
            [appointmentId]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'appointment not found' 
            });
        }

        res.status(200).json({
            success: true,
            data: appointments[0]
        });

    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'server error fetching appointment' 
        });
    }
};

// Update appointment status (doctor/admin)
exports.updateAppointmentStatus = async (req, res) => {
    try {
        // extract id from the url (e.g., /appointments/55)
        //and new state from the data sent (e.g., { "status": "Cancelled" })
        const appointmentId = req.params.id;
        const { status } = req.body;

        if (!status || !['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'invalid state must be: scheduled, completed, or cancelled' 
            });
        }

        const [result] = await db.query(
            'UPDATE Appointment SET status = ? WHERE appointment_id = ?',
            [status, appointmentId]
            // ? marks are safety placeholders prevent SQL injection
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Appointment not found' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'appointment status updated successfully'
        });

    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'server error updating appointment' 
        });
    }
};

// cancel appointment (Patient)
exports.cancelAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const userId = req.user.userId;

        // make sure this appointment belongs to the patient
        const [patients] = await db.query('SELECT patient_id FROM Patient WHERE user_id = ?', [userId]);
        const patientId = patients[0].patient_id;

        const [appointments] = await db.query(
            `SELECT a.appointment_id, a.appointment_date, a.appointment_time, 
                    u.email as patient_email, u.name as patient_name,
                    du.name as doctor_name
             FROM Appointment a
             JOIN Patient p ON a.patient_id = p.patient_id
             JOIN User u ON p.user_id = u.user_id
             JOIN Doctor d ON a.doctor_id = d.doctor_id
             JOIN User du ON d.user_id = du.user_id
             WHERE a.appointment_id = ? AND a.patient_id = ?`,
            [appointmentId, patientId]
        );

        if (appointments.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: 'you can only cancel your own appointments' 
            });
        }

        const appointment = appointments[0];

        // Update status to Cancelled
        await db.query(
            'UPDATE Appointment SET status = "Cancelled" WHERE appointment_id = ?',
            [appointmentId]
        );

        // Send cancellation email
        await sendAppointmentCancellation(
            appointment.patient_email,
            appointment.patient_name,
            appointment.doctor_name,
            appointment.appointment_date,
            appointment.appointment_time
        );

        // Store notification in database
        await db.query(
            'INSERT INTO Notification (user_id, message, type) VALUES (?, ?, ?)',
            [userId, `Your appointment with ${appointment.doctor_name} on ${appointment.appointment_date} has been cancelled`, 'Cancellation']
        );

        res.status(200).json({
            success: true,
            message: 'appointment cancelled successfully. cancellation email sent.'
        });

    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'server error cancelling appointment' 
        });
    }
};

// delete appointment (Admin only)
exports.deleteAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;

        const [result] = await db.query(
            'DELETE FROM Appointment WHERE appointment_id = ?',
            [appointmentId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'appointment not found' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'appointment deleted successfully'
        });

    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'server error deleting appointment' 
        });
    }
};
