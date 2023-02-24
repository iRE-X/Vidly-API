const express = require("express");
const router = express.Router();
// const mongoose = require("mongoose");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");
const { Rental, validate } = require("../models/rental");
const validateRequest = require("../middleware/validate");

// mongoose.connect("mongodb://localhost/vidly")
// .then(() => console.log("Connected to mongoDB..."))
// .catch(err => console.log("Opps!.. Something went wrong..."));

router.get("/", async (req, res) => {
    const rentals = await Rental.find();
    res.send(rentals);
});

router.post("/", validateRequest(validate), async (req, res) => {
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send("Invalid Customer Id ! ...");
    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send("Invalid Movie Id ! ...");

    if (movie.numberInStock === 0)
        return res
            .status(400)
            .send("Sorry!.. Movie is not available at this time...");

    const rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate,
        },
    });

    await rental.save();

    movie.numberInStock--;
    movie.save();

    res.send(rental);
});

module.exports = router;
