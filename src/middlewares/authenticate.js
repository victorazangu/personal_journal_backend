const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const config = require("../config/config")


const IsAuthenticated = (req, res, next) => {
    try {
        const folderPath = path.resolve(`${process.cwd()}/keys`);
        const privateKey = fs.readFileSync(`${folderPath}/private.pem`, 'utf8');

        const token = req.headers.authorization?.split(' ');
        if (!token) res.status(401).json({ message: 'No tokens provided' });

        if (token[0] === 'Bearer' && token[1].match(/\S+\.\S+\.\S+/) !== null) {
            jwt.verify(token[1], privateKey,
                { issuer: config.jwt.issuer, algorithms: [config.jwt.algo], header: { typ: '' } },
                function (err, decoded) {
                    if (err) {
                        res.status(401).json({
                            message: 'Expired or invalid token',
                        });
                    }
                    const user = decoded.payload;
                    req.user = user;
                    next();
                }
            );
        } else {
          return  res.status(401).json({ message: 'Invalid token format' });
        }
    } catch (error) {
      return  res.status(500).json({ message: 'Internal server error' })
    }
};

module.exports = IsAuthenticated;
