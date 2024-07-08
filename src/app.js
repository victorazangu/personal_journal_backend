const express = require('express');
const cors = require('cors');
const timeout = require('connect-timeout');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const sequelize = require('./config/database');
const morgan = require('morgan');
const rfs = require("rotating-file-stream");
const path = require('path');

const app = express();

  
app.use(cors());
app.options('*', cors());
app.use(timeout('60s'))
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));


const accessLogStream = rfs.createStream("logs.log", {
    interval: "7d",
    path: path.join(__dirname, "logs"),
});

morgan.token("user", function (req) {
    if (req.user) {
        const ip = req.ip;
        const full =
            "USER: " +
            " First name: " +
            req.user.name +
            " Email: " +
            req.user.email +
            " id: " +
            req.user.id +
            " IP:" +
            ip +
            "";
        return full;
    }
});

morgan.token("date", function () {
    const p = new Date()
        .toString()
        .replace(/[A-Z]{3}\+/, "+")
        .split(/ /);
    return p[2] + "/" + p[1] + "/" + p[3] + ":" + p[4] + " " + p[5];
});

app.use(
    morgan(
        ':user :remote-addr - :remote-user :date ":method ' +
        ':url HTTP/:http-version" :status :res[content-length] ' +
        '":referrer" ":user-agent"\n',
        { stream: accessLogStream }
    )
);



app.use('/api/v1', routes);




// (async () => {
//     try {
//         await sequelize.sync({ alter: true });

//     } catch (error) {
//         throw new ApiError(error)
//     }
// })();

app.use((req, res, next) => {
    next(new ApiError(404, 'Not found'));
});

app.use(errorConverter);
app.use(errorHandler);

module.exports = app;