const { User } = require("../models")
const bcrypt = require('bcrypt');
const { tokenService, userService } = require("../services")
const config = require("../config/config")

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
        return res.status(201).json({ token });
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

const profile = async (req, res, next) => {
    try {
        const folderPath = path.resolve(`${process.cwd()}/keys`);
        const privateKey = fs.readFileSync(`${folderPath}/private.pem`, 'utf8');
        
        const token = req.headers.authorization?.split(' ');
        if (!(token && token[0] === 'Bearer' && token[1].match(/\S+\.\S+\.\S+/))) {
            return res.status(401).json({
                message: 'Unauthorized: Invalid token format',
            });
        }
        
        jwt.verify(
            token[1],
            privateKey,
            { issuer: config.jwt.issuer, algorithms: [config.jwt.algo], header: { typ: 'Bearer token' } },
            async function (err, decoded) {
                if (err) {
                    return res.status(401).json({
                        message: 'Expired or invalid token, please log in',
                    });
                } else {
                    req.user = decoded.payload; 
                    next(); 
                }
            }
        );
    } catch (error) {
        next(error); 
    }
};


module.exports = {
    index,
    register,
    login,
    profile
}