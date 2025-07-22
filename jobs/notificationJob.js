const cron = require('node-cron');
const db = require('../config/db');

// Runs every 




cron.schedule('* * * * *', () => {
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000); // +30 minutes

    const nowDate = now.toISOString().split('T')[0];
    const nowTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:mm

    const laterTime = thirtyMinutesLater.toTimeString().split(' ')[0].substring(0, 5);

    const query = `
    SELECT users.name, users.email, a.service, a.appointment_date, a.appointment_time
    FROM appointments a
    JOIN users ON a.user_id = users.id
    WHERE a.appointment_date = CURDATE()
      AND a.appointment_time BETWEEN ? AND ?
  `;

    db.query(query, [nowTime, laterTime], (err, results) => {
        if (err) return console.error('Notification job DB error:', err);

        results.forEach((row) => {
            console.log(`🔔 Reminder: ${row.name}, you have a ${row.service} at ${row.appointment_time} today.`);
        });
    });
});