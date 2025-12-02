const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// All routes require authentication and Patient role
router.use(authMiddleware, roleCheck('Patient'));

router.get('/medical-records', patientController.getMyMedicalRecords);
router.patch('/profile', patientController.updateProfile);

module.exports = router;
