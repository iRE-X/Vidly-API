const config = require("config");

module.exports = function (req, res, next) {
    if (!config.get("requireAuth")) return next();
    if (!req.user.isAdmin) return res.status(403).send("Access Denied!.");
    next();
};
