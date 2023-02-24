const Joi = require("joi");
const mongoose = require("mongoose");

const Customer = mongoose.model(
    "Customer",
    new mongoose.Schema({
        name: { type: String, required: true, minlength: 3 },
        phone: { type: Number, required: true, minlength: 10 },
        isGold: { type: Boolean, default: false },
    })
);

function validateCustomer(customer) {
    const schema = {
        name: Joi.string().min(3).required(),
        phone: Joi.number().required(),
        isGold: Joi.boolean(),
    };
    return Joi.validate(customer, schema);
}

exports.Customer = Customer;
exports.validate = validateCustomer;
