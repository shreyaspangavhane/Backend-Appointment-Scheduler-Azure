const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
    bookAppointment,
    getUserAppointments,
    cancelAppointment,
    rescheduleAppointment
} = require('../controllers/appointmentController');


// booking appointment 
router.post('/book', verifyToken, bookAppointment);
router.get('/my', verifyToken, getUserAppointments);

router.put('/:id', verifyToken, rescheduleAppointment);

router.delete('/:id', verifyToken, cancelAppointment);

module.exports = router;