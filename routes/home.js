const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index", {
        title: "Vidly - a video API",
        heading: "Welcome to Vidly...",
    });
});

module.exports = router;
