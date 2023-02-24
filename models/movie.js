const mongoose = require("mongoose");
const { genreSchema } = require("./genre");
const Joi = require("joi");

// Movie Schema
const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 255,
    },
    genre: {
        type: genreSchema,
        required: true,
    },
    liked: {
        type: Boolean,
        default: false,
    },
    numberInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
    },
    dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
    },
});

const Movie = mongoose.model("Movie", movieSchema);

//
// Validator
function validateMovie(movie) {
    const schema = {
        title: Joi.string().required(),
        genreId: Joi.objectId().required(),
        numberInStock: Joi.number().min(0).required(),
        dailyRentalRate: Joi.number().min(0).required(),
    };

    return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.validate = validateMovie;
