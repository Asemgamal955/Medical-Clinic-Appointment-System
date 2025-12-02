const db = require('../config/database');

// Get patient's own medical records
exports.getMyMedicalRecords = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get patient_id
        const [patients] = await db.query('SELECT patient_id FROM Patient WHERE user_id = ?', [userId]);
        
        if (patients.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Patient record not found' 
            });
        }

        const patientId = patients[0].patient_id;

        // Get medical records
        const [records] = await db.query(
            `SELECT 
                mr.record_id, mr.diagnosis, mr.prescription, mr.record_date,
                u.name AS doctor_name, d.specialization,
                a.appointment_date, a.appointment_time
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
        console.error('Get medical records error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching medical records' 
        });
    }
};

// Update patient profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, phone, dateOfBirth, address, medicalHistory } = req.body;

        // Update User table
        if (name || phone) {
            let updateQuery = 'UPDATE User SET';
            let params = [];
            
            if (name) {
                updateQuery += ' name = ?';
                params.push(name);
            }
            if (phone) {
                if (params.length > 0) updateQuery += ',';
                updateQuery += ' phone = ?';
                params.push(phone);
            }
            
            updateQuery += ' WHERE user_id = ?';
            params.push(userId);
            
            await db.query(updateQuery, params);
        }

        // Update Patient table
        if (dateOfBirth || address || medicalHistory) {
            let updateQuery = 'UPDATE Patient SET';
            let params = [];
            
            if (dateOfBirth) {
                updateQuery += ' date_of_birth = ?';
                params.push(dateOfBirth);
            }
            if (address) {
                if (params.length > 0) updateQuery += ',';
                updateQuery += ' address = ?';
                params.push(address);
            }
            if (medicalHistory) {
                if (params.length > 0) updateQuery += ',';
                updateQuery += ' medical_history = ?';
                params.push(medicalHistory);
            }
            
            updateQuery += ' WHERE user_id = ?';
            params.push(userId);
            
            await db.query(updateQuery, params);
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error updating profile' 
        });
    }
};
