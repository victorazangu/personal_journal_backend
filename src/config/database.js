const { Sequelize } = require("sequelize");
const config = require("./config");

const host = config.mysql.host;
const user = config.mysql.user;
const database = config.mysql.name;
const password = config.mysql.password;
const port = config.mysql.port;

const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: "mysql", 
  logging: false, 
});

module.exports = sequelize;
