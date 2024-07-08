const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const config = require("../config/config")


const folderPath = path.resolve(`${process.cwd()}/keys`);
const privateKey = fs.readFileSync(`${folderPath}/private.pem`, 'utf8');

const generateToken = (user) => {
    const data = {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        image: user?.image,
    };

    const token = jwt.sign(
        { payload: data },
        {
            key: privateKey.replace(/\\n/gm, '\n'),
            passphrase: config.jwt.secret,
        },
        {
            issuer: config.jwt.issuer,
            algorithm: config.jwt.algo,
            expiresIn: config.jwt.expire_in_days,
        }
    );
    return token;
};

const verifyToken2 = async(token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            privateKey,
            { issuer: TokenIssuer, algorithms: ['RS512'], header: { typ: 'Bearer token' } },
            (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded.payload);
                }
            }
        );
    });
}

const verifyToken = async (token) => {
    try {
        const decoded =  jwt.verify(token, privateKey, {
            issuer: config.jwt.issuer,
            algorithms: [config.jwt.algo],
            typ: 'JWT',
        });
        return decoded.payload;
    } catch (err) {
        throw err; 
    }
};


module.exports = { generateToken ,verifyToken};
