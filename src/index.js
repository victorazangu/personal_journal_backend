const http = require('http');
const app = require('./app');
const config = require('./config/config');
const sequelize = require("./config/database")

let server;

sequelize
    .authenticate()
    .then(() => {
        console.info('Connected to DB');
        server = http.createServer(app);
        // const options = {
        //     cors: true,
        //     origins: ['*'],
        // };
        server.listen(config.port, () => {
            console.info(`Listening to port ${config.port}`);
        });
        process.on('SIGTERM', () => {
            console.info('SIGTERM received');
            if (server) {
                server.close();
            }
        });

    }).catch(error => {
        console.error('Unable to connect to the database:', error);
    });


