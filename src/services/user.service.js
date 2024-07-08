const tokenService = require("./token.service")


const getProfile = async (token) => {
    try {
        if (token && token[0] === 'Bearer' && token[1]?.match(/\S+\.\S+\.\S+/)) {
            const decodedData = await tokenService.verifyToken(token[1]);
            return decodedData
        }
    } catch (error) {
        throw new Error('Expired or invalid token, please log in');
    }
}

module.exports ={
    getProfile
}