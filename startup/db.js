const colors = require("colors");
const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

mongoose.set("strictQuery", false);

module.exports = function () {
    const db = config.get("db");
    mongoose
        .connect(db)
        .then(() => winston.info(`Connected to Database`.green));
};

// MongoDB Atlas Link

// "mongodb+srv://Lucifer:Lucifer123@cluster0.nzlofb3.mongodb.net/?retryWrites=true&w=majority"
