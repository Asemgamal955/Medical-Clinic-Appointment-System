const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// All routes require authentication and Admin role
router.use(authMiddleware, roleCheck('Admin'));

router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/statistics', adminController.getStatistics);
router.get('/reports/appointments', adminController.getAppointmentsReport);

module.exports = router;
