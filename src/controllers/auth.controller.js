const { User } = require("../models")
const bcrypt = require('bcrypt');
const { tokenService, userService } = require("../services")
const config = require("../config/config")
const path = require("path")
const fs = require("fs")
const jwt = require("jsonwebtoken")

const index = (req, res) => {
    return res.status(200).json({ message: "Hello World!" });
}

const register = async (req, res) => {
    const { name, email, phone, password, image } = req.body;

    try {
        const existingUser = await User.findOne({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password, salt);
        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            phone,
            image,
            password: hashedPassword,
        });
        const token = tokenService.generateToken(newUser);
        return res.status(201).json({ token, user: newUser });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Server side error" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({
            where: {
                email: email.toLowerCase(),
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = tokenService.generateToken(user);
        return res.status(200).json({ token });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

const profile = (req, res) => {
    const folderPath = path.resolve(`${process.cwd()}/keys`);
    const privateKey = fs.readFileSync(`${folderPath}/private.pem`, 'utf8');
    const token = req.headers.authorization?.split(' ');
    if (token[0] === 'Bearer' && token[1].match(/\S+\.\S+\.\S+/) !== null) {
        jwt.verify(
            token[1],
            privateKey,
            { issuer: config.jwt.issuer, algorithms: [config.jwt.algo], header: { typ: 'Bearer token' } },
            async function (err, decoded) {
                if (err) {
                    res.status(401).json({
                        message: 'Expired or invalid token, please log in',
                    });
                } else {
                    const decodedData = decoded.payload;
                    res.status(200).json({ user: decodedData });
                }
            }
        );
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;
        const updatedUser = await User.update(
            { name, email },
            { where: { id: userId }, returning: true }
        );

        if (updatedUser[0] === 0) {
            return res.status(404).json({ error: "User not found", status: "fail", success: false });
        }

        const updatedUserData = updatedUser[1][0].get();
        return res.status(200).json({ data: updatedUserData, status: "success", success: true });
    } catch (error) {
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};


const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found", status: "fail", success: false });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Current password is incorrect", status: "fail", success: false });
        }
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await user.update({ password: hashedPassword });
        return res.status(200).json({ message: "Password updated successfully", status: "success", success: true });
    } catch (error) {
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};

module.exports = {
    index,
    register,
    login,
    profile,
    updateProfile,
    updatePassword
}