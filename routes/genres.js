const express = require("express");
const router = express.Router();
const { Genre, validate } = require("../models/genre");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const validateRequest = require("../middleware/validate");

router.get("/", async (req, res) => {
    // throw new Error("Couldn't get the Genres!.");
    const genres = await Genre.find().sort("name");
    res.send(genres);
});

router.post("/", [auth, validateRequest(validate)], async (req, res) => {
    if (await Genre.findOne({ name: req.body.name }))
        return res.status(400).send("Genre already exist!.");

    const genre = new Genre({
        name: req.body.name,
    });
    res.send(await genre.save());
});

router.put("/:id", [auth, validateRequest(validate)], async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                name: req.body.name,
            },
        },
        { new: true }
    );

    if (!genre) return res.status(404).send("The given ID is Invalid !!...");
    res.send(genre);
});

router.delete("/:id", [auth, admin], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if (!genre) return res.status(404).send("Given ID is Invalid !!...");
    res.send(genre);
});

router.get("/:id", validateObjectId, async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).send("Given ID is Invalid !!...");
    res.send(genre);
});

module.exports = router;
