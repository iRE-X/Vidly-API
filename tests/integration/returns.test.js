const { Rental } = require("../../models/rental");
const mongoose = require("mongoose");
const request = require("supertest");
const { User } = require("../../models/user");
const moment = require("moment");
const { Movie } = require("../../models/movie");

describe("/api/returns", () => {
    let server;
    let customerId, movieId, rental, movie, token;
    beforeEach(async () => {
        server = require("../../index");

        customerId = mongoose.Types.ObjectId().toHexString();
        movieId = mongoose.Types.ObjectId().toHexString();
        token = new User().generateAuthToken();

        movie = new Movie({
            _id: movieId,
            title: "movie1",
            genre: { name: "genre1" },
            dailyRentalRate: 2,
            numberInStock: 10,
        });
        await movie.save();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: "customer1",
                phone: "12345",
            },
            movie: {
                _id: movieId,
                title: "movie1",
                dailyRentalRate: 2,
            },
        });
        await rental.save();
    });

    const exec = () => {
        return request(server)
            .post("/api/returns")
            .set("x-auth-token", token)
            .send({ customerId, movieId });
    };

    afterEach(async () => {
        await server.close();
        await Rental.remove({});
        await Movie.remove({});
    });

    it("should return 401 if client is not logged in.", async () => {
        token = "";
        const res = await exec();
        expect(res.status).toBe(401);
    });

    it("should return 400 if customerId is not provided.", async () => {
        customerId = "";
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it("should return 400 if movieId is not provided.", async () => {
        movieId = "";
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it("should return 404 if no rental found for the customer/movie.", async () => {
        await Rental.remove({});
        const res = await exec();
        expect(res.status).toBe(404);
    });

    it("should return 400 if rental already processed.", async () => {
        rental.dateReturned = new Date();
        await rental.save();
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it("should return 200 if it is a valid request.", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
    });

    it("should set the return date if input is valid.", async () => {
        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned;
        expect(diff).toBeLessThan(10 * 1000);
    });

    it("should set the rental fee if input is valid.", async () => {
        rental.dateOut = moment().add(-7, "days").toDate();
        await rental.save();
        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(14);
    });

    it("should increase the movie stock if input is valid.", async () => {
        const res = await exec();
        const movieInDb = await Movie.findById(movie._id);
        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it("should return the processed rental if input is valid.", async () => {
        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);

        expect(res.body).toHaveProperty(
            "dateOut",
            "rentalFee",
            "customer",
            "movie",
            "dateReturned"
        );

        // Alternative

        // expect(Object.keys(res.body)).toEqual(
        //     expect.arrayContaining([
        //         "dateOut",
        //         "rentalFee",
        //         "customer",
        //         "movie",
        //         "dateReturned",
        //     ])
        // );
    });
});
