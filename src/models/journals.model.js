const { DataTypes } = require('sequelize');
const sequelize = require('../config/database')
const Category = require("./categories.model");
const User = require('./users.model');

const Journal = sequelize.define('Journal', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    author: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'id',
        },
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Category,
            key: 'id',
        },
    },
}, {
    timestamps: true,
});


Journal.belongsTo(Category, { foreignKey: 'category_id' });
Journal.belongsTo(User, { foreignKey: 'author' });

module.exports = Journal;



