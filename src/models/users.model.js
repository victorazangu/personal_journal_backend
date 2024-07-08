const { DataTypes } = require('sequelize');
const sequelize = require('../config/database')



const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isNumeric: true,
            len: [10, 15]
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [8, 255],
        }

    },
    image: {
        type: DataTypes.STRING,
        defaultValue: 'default.png'
    }
}, {
    timestamps: true,
});

module.exports = User;


