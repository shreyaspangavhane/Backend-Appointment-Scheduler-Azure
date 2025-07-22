const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
require('./jobs/notificationJob');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Authorization Route
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Appointment Route
const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes);


app.get('/', (req, res) => {
    res.send('Appointment Scheduler API is running');
});

// here i make dummy testing 
const verifyToken = require('./middleware/authMiddleware');

app.get('/api/protected', verifyToken, (req, res) => {
    res.json({ message: `Welcome user ${req.user.id}, you're authorized!` });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});