// Handles all administrative tasks like managing users, viewing system stats, and generating reports.
//  Only users with the "Admin" role can access these functions.

// import the database connection we set up
const db = require('../config/database');

// Get all users (Admin only)
// get a list of all registered users (Patients, Doctors, Admins).
exports.getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;

        // Excludes sensitive data like passwords
        let query = 'SELECT user_id, email, role, name, phone, created_at FROM User';
        let params = [];

        // Filter by role if provided
        if (role) {
            query += ' WHERE role = ?';// Can filter by role (?role=Doctor shows only doctors)
            params.push(role);
        }

        query += ' ORDER BY created_at DESC';

        const [users] = await db.query(query, params);

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching users' 
        });
    }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent admin from deleting themselves
        if (parseInt(userId) === req.user.userId) {
            return res.status(400).json({ // Bad Request error
                success: false, 
                message: 'you cannot delete your account' 
            });
        }

        const [result] = await db.query('DELETE FROM User WHERE user_id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'user deleted successfuly'
        });

    } catch (error) {
        console.error('delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'server error deleting user' 
        });
    }
};

// Get system statistics (Admin dashboard)
// executes separate database queries to provide a snapshot of the system state
exports.getStatistics = async (req, res) => {
    try {
        // find out how many users exist for each role
        // Result: An array of objects, ex:[{ role: 'doctor', count: 5 }, { role: 'patient', count: 100 }]
        const [userCounts] = await db.query(
            'SELECT role, COUNT(*) as count FROM User GROUP BY role'
        );

        // count appointments by status
        // [{ status: 'pending', count: 3 }, { status: 'completed', count: 10 }]
        const [appointmentCounts] = await db.query(
            'SELECT status, COUNT(*) as count FROM Appointment GROUP BY status'
        );

        // total appointments
        const [totalAppointments] = await db.query(
            'SELECT COUNT(*) as total FROM Appointment'
        );

        // appointments today
        const [todayAppointments] = await db.query(
            'SELECT COUNT(*) as total FROM Appointment WHERE appointment_date = CURDATE()'
        );

        // total medical records
        const [totalRecords] = await db.query(
            'SELECT COUNT(*) as total FROM Medical_Record'
        );

        res.status(200).json({
            success: true,
            data: {
                users: userCounts,
                appointments: appointmentCounts,
                totalAppointments: totalAppointments[0].total,
                todayAppointments: todayAppointments[0].total,
                totalMedicalRecords: totalRecords[0].total
            }
        });// sends that data back to the client as a json object

    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching statistics' 
        });
    }
};

// Get appointments report (Admin)
exports.getAppointmentsReport = async (req, res) => {
/*
is a flexible search and reporting function for administrator
retrieves detailed rows of data based on what provided by the user
*/
    try {
        // grabs parameters from the URL query string
        const { startDate, endDate, status, doctorId } = req.query;// extract the input(filter)
        
        let query = `
            SELECT 
                a.appointment_id, a.appointment_date, a.appointment_time, a.status,
                up.name AS patient_name, up.phone AS patient_phone,
                ud.name AS doctor_name, d.specialization
            FROM Appointment a
            JOIN Patient p ON a.patient_id = p.patient_id
            JOIN User up ON p.user_id = up.user_id
            JOIN Doctor doc ON a.doctor_id = doc.doctor_id
            JOIN User ud ON doc.user_id = ud.user_id
            WHERE 1=1 
        `;// placeholder WHERE clause for dynamic filters
        // Connects data from Appointment, Patient, Doctor, User tables
        // to show full names and details instead of just IDs.
        let params = [];

        // Add filters
        if (startDate) {
            query += ' AND a.appointment_date >= ?';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND a.appointment_date <= ?';
            params.push(endDate);
        }
        if (status) {
            query += ' AND a.status = ?';// ? marks are used to prevent SQL Injection
            params.push(status);
        }
        if (doctorId) {
            query += ' AND a.doctor_id = ?';
            params.push(doctorId);
        }

        query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

        const [appointments] = await db.query(query, params);

        res.status(200).json({
            success: true,
            count: appointments.length,
            filters: { startDate, endDate, status, doctorId },
            data: appointments
        });

    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error generating report' 
        });
    }
};
