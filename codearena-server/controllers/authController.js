const { User } = require('../models');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret_key', {
        expiresIn: '24h',
    });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.create({ username, email, password });
        const token = generateToken(user);
        res.status(201).json({ user: { id: user.id, username: user.username, email: user.email }, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || !(await user.validatePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = generateToken(user);
        res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
