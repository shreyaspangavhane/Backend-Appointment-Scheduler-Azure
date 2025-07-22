const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.signup = async(req, res) => {
    const { name, email, password } = req.body;

    // Check if all fields are filled
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if user already exists
        db.query('SELECT * FROM users WHERE email = ?', [email], async(err, results) => {
            if (results.length > 0) {
                return res.status(409).json({ message: 'User already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user
            db.query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: 'Database error', error: err });
                    }
                    res.status(201).json({ message: 'User registered successfully' });
                }
            );
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};


const jwt = require('jsonwebtoken');

exports.login = async(req, res) => {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user
    db.query('SELECT * FROM users WHERE email = ?', [email], async(err, results) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    });
};