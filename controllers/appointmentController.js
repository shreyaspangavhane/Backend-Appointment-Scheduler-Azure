const db = require('../config/db');

exports.bookAppointment = (req, res) => {
    const userId = req.user.id;
    const { service, appointment_date, appointment_time } = req.body;

    if (!service || !appointment_date || !appointment_time) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if time slot already booked
    const query = `SELECT * FROM appointments 
                 WHERE appointment_date = ? AND appointment_time = ?`;

    db.query(query, [appointment_date, appointment_time], (err, results) => {
        if (results.length > 0) {
            return res.status(409).json({ message: 'Time slot already booked' });
        }

        // Book the appointment
        const insertQuery = `INSERT INTO appointments (user_id, service, appointment_date, appointment_time) 
                         VALUES (?, ?, ?, ?)`;

        db.query(insertQuery, [userId, service, appointment_date, appointment_time], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }

            res.status(201).json({ message: 'Appointment booked successfully' });
        });
    });
};


exports.getUserAppointments = (req, res) => {
    const userId = req.user.id;

    const query = `
    SELECT id, service, appointment_date, appointment_time 
    FROM appointments 
    WHERE user_id = ? 
    ORDER BY appointment_date ASC, appointment_time ASC
  `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        res.status(200).json({
            appointments: results,
        });
    });
};

//cancling appointment function
exports.cancelAppointment = (req, res) => {
    const userId = req.user.id;
    const appointmentId = req.params.id;

    const query = 'DELETE FROM appointments WHERE id = ? AND user_id = ?';

    db.query(query, [appointmentId, userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointment not found or unauthorized' });
        }

        res.status(200).json({ message: 'Appointment cancelled successfully' });
    });
};

// Reschedule Appointment
exports.rescheduleAppointment = (req, res) => {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    const { appointment_date, appointment_time } = req.body;

    if (!appointment_date || !appointment_time) {
        return res.status(400).json({ message: 'New date and time are required' });
    }

    // Check if the new slot is available
    const checkQuery = `SELECT * FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND id != ?`;
    db.query(checkQuery, [appointment_date, appointment_time, appointmentId], (err, results) => {
        if (err) return res.status(500).json({ message: 'DB error' });

        if (results.length > 0) {
            return res.status(409).json({ message: 'New time slot already booked' });
        }

        // Update the appointment
        const updateQuery = `
      UPDATE appointments 
      SET appointment_date = ?, appointment_time = ?
      WHERE id = ? AND user_id = ?
    `;

        db.query(updateQuery, [appointment_date, appointment_time, appointmentId, userId], (err, result) => {
            if (err) return res.status(500).json({ message: 'DB error', error: err });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Appointment not found or unauthorized' });
            }

            res.status(200).json({ message: 'Appointment rescheduled successfully' });


        });
    });
};