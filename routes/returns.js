const auth = require("../middleware/auth");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const Joi = require("joi");
const router = require("express").Router();
const validate = require("../middleware/validate");

router.post("/", [auth, validate(validateReturn)], async (req, res) => {
    const rental = await Rental.lookUp(req.body.customerId, req.body.movieId);
    if (!rental) return res.status(404).send("rental not found!.");

    if (rental.dateReturned)
        return res.status(400).send("return already processed.");

    rental.return();
    await rental.save();

    // const movie = await Movie.findById(rental.movie._id);
    // movie.numberInStock++;
    await Movie.updateOne(
        { _id: rental.movie._id },
        {
            $inc: { numberInStock: 1 },
        }
    );

    res.send(rental);
});

function validateReturn(rental) {
    const schema = {
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required(),
    };

    return Joi.validate(rental, schema);
}

module.exports = router;
