const express = require('express');
const authRouter = require("./auth.route")
const journal = require("./journal.route")
const category = require("./category.route")

const router = express.Router();
const defaultRoutes = [
    { path: '/auth', route: authRouter },
    { path: '/journals', route: journal },
    { path: '/categories', route: category },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
