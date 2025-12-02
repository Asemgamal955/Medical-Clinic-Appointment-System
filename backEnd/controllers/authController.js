const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Generate JWT token
const generateToken = (userId, email, role) => {
    return jwt.sign(
        { userId, email, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// register new user
exports.register = async (req, res) => {
    try {
        const { email, password, role, name, phone, dateOfBirth, address, specialization, workingHours } = req.body;

        // Validate required fields
        if (!email || !password || !role || !name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide email, password, role, and name' 
            });
        }

        // Check if user already exists
        const [existingUser] = await db.query('SELECT user_id FROM User WHERE email = ?', [email]);
        
        if (existingUser.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO User (email, password, role, name, phone) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, role, name, phone]
        );

        const userId = result.insertId;

        // Insert role-specific data
        if (role === 'Patient') {
            await db.query(
                'INSERT INTO Patient (user_id, date_of_birth, address) VALUES (?, ?, ?)',
                [userId, dateOfBirth || null, address || null]
            );
        } else if (role === 'Doctor') {
            await db.query(
                'INSERT INTO Doctor (user_id, specialization, working_hours) VALUES (?, ?, ?)',
                [userId, specialization || null, workingHours || null]
            );
        }

        // Generate token
        const token = generateToken(userId, email, role);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                userId,
                email,
                name,
                role,
                token
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide email and password' 
            });
        }

        // Get user from database
        const [users] = await db.query(
            'SELECT user_id, email, password, role, name FROM User WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        const user = users[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Generate token
        const token = generateToken(user.user_id, user.email, user.role);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                userId: user.user_id,
                email: user.email,
                name: user.name,
                role: user.role,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [users] = await db.query(
            'SELECT user_id, email, role, name, phone, created_at FROM User WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const user = users[0];

        // Get role-specific data
        if (user.role === 'Patient') {
            const [patients] = await db.query(
                'SELECT date_of_birth, address, medical_history FROM Patient WHERE user_id = ?',
                [userId]
            );
            user.patientInfo = patients[0];
        } else if (user.role === 'Doctor') {
            const [doctors] = await db.query(
                'SELECT specialization, working_hours FROM Doctor WHERE user_id = ?',
                [userId]
            );
            user.doctorInfo = doctors[0];
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching profile' 
        });
    }
};
