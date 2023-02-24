const express = require("express");
const router = express.Router();
const { Movie, validate } = require("../models/movie");
const { Genre } = require("../models/genre");
const validateRequest = require("../middleware/validate");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");

router.get("/", async (req, res) => {
    const movies = await Movie.find().sort("name");
    res.send(movies);
});

router.get("/:id", validateObjectId, async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("Given id is invalid!.");
    res.send(movie);
});

router.get("/:genre", async (req, res) => {
    const reqMovies = await Movie.find({ "genre.name": req.params.genre }).sort(
        "name"
    );
    res.send(reqMovies);
});

router.post("/", [auth, validateRequest(validate)], async (req, res) => {
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) res.status(400).send("Invalid genre !..");

    const movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name,
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
    });
    res.send(await movie.save());
});

router.put("/:id", [auth], async (req, res) => {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body);
    if (!movie) return res.status(404).send("Given id is invalid!..");
    res.send(movie);
});

router.delete("/:id", [auth, admin], async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);
    if (!movie) return res.status(404).send("Given id is invalid!..");
    res.send(movie);
});

module.exports = router;

// const mongoose = require("mongoose");
// mongoose
//     .connect("mongodb://localhost/vidly")
//     .then(() => console.log("Connected to mongoDB.."))
//     .catch(err => console.log("Oops!.. Something Went Worong => "));

// const movies = [
//     { name: "Avengers: Endgame", genre: "action" },
//     { name: "Mission Impossible", genre: "action" },
//     { name: "Memories of Alhambra", genre: "sci-fi" },
//     { name: "Alice", genre: "sci-fi" },
// ];

// async function createMovie(title, genre) {
//     const movie = new Movie({
//         title,
//         genre,
//     });

//     const result = await movie.save();
//     console.log(result);
// }

// createMovie("Terminator", new Genre({ name: "Sci-fi" }));
