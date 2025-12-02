const db = require('../config/database');

// Get all doctors (for patient to choose from)
exports.getAllDoctors = async (req, res) => {
    try {
        const [doctors] = await db.query(
            `SELECT 
                d.doctor_id, u.name, u.phone, u.email,
                d.specialization, d.working_hours
            FROM Doctor d
            JOIN User u ON d.user_id = u.user_id
            ORDER BY u.name`
        );

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });

    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching doctors' 
        });
    }
};

// Get doctor's schedule (appointments for specific date)
exports.getDoctorSchedule = async (req, res) => {
    try {
        const { date } = req.query;
        const userId = req.user.userId;

        // Get doctor_id
        const [doctors] = await db.query('SELECT doctor_id FROM Doctor WHERE user_id = ?', [userId]);
        
        if (doctors.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Doctor record not found' 
            });
        }

        const doctorId = doctors[0].doctor_id;

        let query = `
            SELECT 
                a.appointment_id, a.appointment_date, a.appointment_time, a.status, a.notes,
                u.name AS patient_name, u.phone AS patient_phone,
                p.date_of_birth, p.medical_history
            FROM Appointment a
            JOIN Patient p ON a.patient_id = p.patient_id
            JOIN User u ON p.user_id = u.user_id
            WHERE a.doctor_id = ?
        `;

        let params = [doctorId];

        // Filter by date if provided
        if (date) {
            query += ' AND a.appointment_date = ?';
            params.push(date);
        }

        query += ' ORDER BY a.appointment_date, a.appointment_time';

        const [appointments] = await db.query(query, params);

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });

    } catch (error) {
        console.error('Get schedule error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching schedule' 
        });
    }
};

// Add medical record (Doctor only)
exports.addMedicalRecord = async (req, res) => {
    try {
        const { appointmentId, diagnosis, prescription } = req.body;
        const userId = req.user.userId;

        // Validate input
        if (!appointmentId || !diagnosis) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide appointment ID and diagnosis' 
            });
        }

        // Get doctor_id
        const [doctors] = await db.query('SELECT doctor_id FROM Doctor WHERE user_id = ?', [userId]);
        const doctorId = doctors[0].doctor_id;

        // Get appointment details and verify it belongs to this doctor
        const [appointments] = await db.query(
            'SELECT patient_id, doctor_id FROM Appointment WHERE appointment_id = ?',
            [appointmentId]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Appointment not found' 
            });
        }

        if (appointments[0].doctor_id !== doctorId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You can only add records for your own appointments' 
            });
        }

        const patientId = appointments[0].patient_id;

        // Check if record already exists for this appointment
        const [existing] = await db.query(
            'SELECT record_id FROM Medical_Record WHERE appointment_id = ?',
            [appointmentId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Medical record already exists for this appointment' 
            });
        }

        // Insert medical record
        const [result] = await db.query(
            'INSERT INTO Medical_Record (patient_id, doctor_id, appointment_id, diagnosis, prescription) VALUES (?, ?, ?, ?, ?)',
            [patientId, doctorId, appointmentId, diagnosis, prescription || null]
        );

        // Update appointment status to Completed
        await db.query(
            'UPDATE Appointment SET status = "Completed" WHERE appointment_id = ?',
            [appointmentId]
        );

        res.status(201).json({
            success: true,
            message: 'Medical record added successfully',
            data: {
                recordId: result.insertId,
                patientId,
                doctorId,
                appointmentId,
                diagnosis,
                prescription
            }
        });

    } catch (error) {
        console.error('Add medical record error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error adding medical record' 
        });
    }
};

// Get patient's medical records (Doctor viewing specific patient)
exports.getPatientRecords = async (req, res) => {
    try {
        const patientId = req.params.patientId;

        const [records] = await db.query(
            `SELECT 
                mr.record_id, mr.diagnosis, mr.prescription, mr.record_date,
                u.name AS doctor_name, d.specialization,
                a.appointment_date
            FROM Medical_Record mr
            JOIN Doctor d ON mr.doctor_id = d.doctor_id
            JOIN User u ON d.user_id = u.user_id
            JOIN Appointment a ON mr.appointment_id = a.appointment_id
            WHERE mr.patient_id = ?
            ORDER BY mr.record_date DESC`,
            [patientId]
        );

        res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });

    } catch (error) {
        console.error('Get patient records error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching medical records' 
        });
    }
};
