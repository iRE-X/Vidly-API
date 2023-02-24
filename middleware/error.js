const winston = require("winston");

module.exports = function (err, req, res, next) {
    winston.error("Something went wrong!.", err.message, err);
    res.status(500).send("Something went wrong!.");
    next();
};
