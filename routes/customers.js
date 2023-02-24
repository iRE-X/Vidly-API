const express = require("express");
const router = express.Router();
const { Customer, validate } = require("../models/customer");
const validateRequest = require("../middleware/validate");

router.post("/", validateRequest(validate), async (req, res) => {
    const isExist = await Customer.find({ name: req.body.name }).count();
    if (isExist)
        return res
            .status(400)
            .send("Customer name is already exists in the DataBase...");

    const customer = new Customer(req.body);
    res.send(await customer.save());
});

router.put("/:id", validateRequest(validate), async (req, res) => {
    const result = await Customer.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                name: req.body.name,
                phone: req.body.phone,
                isGold: req.body.isGold,
            },
        },
        { new: true }
    );

    if (!result) return res.status(404).send("Given ID doesn't exists...");
    res.send(result);
});

router.delete("/:id", async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) return res.status(404).send("Given ID doesn't exists...");
    res.send(customer);
});

router.get("/", async (req, res) => {
    const customers = await Customer.find().sort("name");
    res.send(customers);
});
router.get("/:id", async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send("Given ID doesn't exists...");
    res.send(customer);
});

module.exports = router;

// const mongoose = require("mongoose");
// mongoose
//     .connect("mongodb://localhost/vidly")
//     .then(() => console.log("Connected to mongoDB..."))
//     .catch(err => console.log("Opps!.. Something went wrong..."));
