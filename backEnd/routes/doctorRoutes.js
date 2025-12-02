const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// Public route (no auth needed to view doctors list)
router.get('/', doctorController.getAllDoctors);

// Doctor-only routes
router.get('/schedule', authMiddleware, roleCheck('Doctor'), doctorController.getDoctorSchedule);
router.post('/medical-records', authMiddleware, roleCheck('Doctor'), doctorController.addMedicalRecord);
router.get('/patients/:patientId/records', authMiddleware, roleCheck('Doctor'), doctorController.getPatientRecords);

module.exports = router;
