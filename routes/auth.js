const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const validateRequest = require("../middleware/validate");

router.post("/", validateRequest(validate), async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid email address!...");

    const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
    );
    if (!isValidPassword) return res.status(400).send("Invalid Password!...");

    const token = user.generateAuthToken();

    res.send(token);
});

function validate(user) {
    const schema = {
        email: Joi.string().min(10).max(50).required().email(),
        password: Joi.string().min(8).max(20).required(),
    };

    return Joi.validate(user, schema);
}

module.exports = router;
