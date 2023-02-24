const express = require("express");
const router = express.Router();
const { User, validate } = require("../models/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const validateRequest = require("../middleware/validate");

router.get("/me", auth, async (req, res) => {
    res.send(await User.findById(req.user._id).select("-password"));
});

router.post("/", validateRequest(validate), async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("Email already registerd...");

    user = await new User(_.pick(req.body, ["email", "name", "password"]));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const token = user.generateAuthToken();

    res.header("x-auth-token", token)
        .header("access-control-expose-headers", "x-auth-token")
        .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
