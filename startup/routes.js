const express = require("express");
const config = require("config");
const cors = require("cors");

const home = require("../routes/home");
const movies = require("../routes/movies");
const genres = require("../routes/genres");
const customers = require("../routes/customers");
const rentals = require("../routes/rentals");
const users = require("../routes/users");
const auth = require("../routes/auth");
const returns = require("../routes/returns");
const error = require("../middleware/error");

module.exports = function (app) {
    app.set("view engine", "pug");
    app.use(cors({ origin: config.get("frontEndOrigin") }));

    app.use(express.json());
    app.use("/", home);
    app.use("/api/movies/", movies);
    app.use("/api/genres/", genres);
    app.use("/api/customers/", customers);
    app.use("/api/rentals/", rentals);
    app.use("/api/users/", users);
    app.use("/api/auth/", auth);
    app.use("/api/returns/", returns);
    app.use(error);
};
