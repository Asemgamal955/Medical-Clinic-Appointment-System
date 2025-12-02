const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Patient routes
router.post('/', roleCheck('Patient'), appointmentController.createAppointment);
router.patch('/:id/cancel', roleCheck('Patient'), appointmentController.cancelAppointment);

// Get appointments (all roles can access, filtered by role in controller)
router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);

// Doctor/Admin routes
router.patch('/:id/status', roleCheck('Doctor', 'Admin'), appointmentController.updateAppointmentStatus);

// Admin only routes
router.delete('/:id', roleCheck('Admin'), appointmentController.deleteAppointment);

module.exports = router;
