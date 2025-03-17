const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/user");

const signup = async (req, res) => {
    try {
        const { name, employeeId, email, password } = req.body;

        const existingUser = await UserModel.findOne({ 
            $or: [{ employeeId }, { email }] 
        });

        if (existingUser) {
            const message = existingUser.email === email 
                ? 'User with this email already exists, please login.' 
                : 'Employee ID already exists, please choose a different one.';

            return res.status(409).json({ message, success: false });
        }

        const userModel = new UserModel({ name, employeeId, email });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();

        res.status(201).json({
            message: "Signup successful.",
            success: true
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        const errorMsg = 'Auth failed: email or password is incorrect.';

        if (!user) {
            return res.status(403).json({ message: errorMsg, success: false });
        }

        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403).json({ message: errorMsg, success: false });
        }

        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id, employeeId: user.employeeId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Login successful.",
            success: true,
            jwtToken,
            email: user.email,
            name: user.name,
            employeeId: user.employeeId,
            projects: user.projects,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};

module.exports = { signup, login };