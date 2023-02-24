let server;
const mongoose = require("mongoose");
const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");

describe("/api/genres", () => {
    beforeEach(() => {
        server = require("../../index");
    });
    afterEach(async () => {
        await server.close();
        await Genre.remove({});
    });

    describe("GET /", () => {
        it("should return the list of Genres.", async () => {
            await Genre.collection.insertMany([
                { name: "genre1" },
                { name: "genre2" },
            ]);
            const res = await request(server).get("/api/genres");
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === "genre1")).toBeTruthy();
            expect(res.body.some(g => g.name === "genre2")).toBeTruthy();
        });
    });

    describe("GET /:id", () => {
        it("should return the Genre with the given id if it exists.", async () => {
            const genre = new Genre({ name: "genre1" });
            await genre.save();
            const res = await request(server).get(`/api/genres/${genre._id}`);
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ name: "genre1" });
        });

        it("should response with status 404 for invalid genre id.", async () => {
            const res = await request(server).get(`/api/genres/1`);
            expect(res.status).toBe(404);
        });

        it("should response with status 404 if genre with the given id not exist.", async () => {
            const id = mongoose.Types.ObjectId().toHexString();
            const res = await request(server).get(`/api/genres/${id}`);
            expect(res.status).toBe(404);
        });
    });

    describe("POST /", () => {
        // Define the happy path, and then in each test, we change one
        // parameter that clearly aligns with the name of the test.

        // variables
        let token;
        let name;

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = "genre1";
        });
        // Happy Path
        const exec = () => {
            return request(server)
                .post("/api/genres")
                .set("x-auth-token", token)
                .send({ name });
        };

        it("should return 401 if client is not logged in.", async () => {
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it("should return 400 if genre is less than 5 characters.", async () => {
            name = "1234";
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if genre is more than 50 characters.", async () => {
            name = new Array(53).join("a");
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should save the genre if it is valid.", async () => {
            const res = await exec();
            const genre = await Genre.find({ name: "genre1" });
            expect(genre).not.toBeNull();
        });

        it("should return the genre if it is valid.", async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "genre1");
        });

        it("should return 400 if the genre already exists.", async () => {
            const res1 = await exec();
            const res2 = await exec();

            expect(res1.status).toBe(200);
            expect(res2.status).toBe(400);
        });
    });

    describe("PUT /:id", () => {
        let name, id;
        beforeEach(() => {
            name = "genre_new";
            id = mongoose.Types.ObjectId().toHexString();
        });
        const exec = () => {
            return request(server).put(`/api/genres/${id}`).send({ name });
        };

        it("should return 400 if genre name is less than 5 characters.", async () => {
            name = "1234";
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 404 if no genre is found with the given id.", async () => {
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it("should update the genre with the given id.", async () => {
            const genre = new Genre({
                name: "genre_old",
            });
            await genre.save();
            id = genre._id;

            const res = await exec();

            const result = await Genre.findById(genre._id);
            expect(res.status).toBe(200);
            expect(result.name).toBe("genre_new");
        });
    });

    describe("DELETE /:id", () => {
        let token, id;
        beforeEach(() => {
            token = new User({
                _id: mongoose.Types.ObjectId().toHexString(),
                isAdmin: true,
            }).generateAuthToken();
            id = mongoose.Types.ObjectId().toHexString();
        });

        const exec = () => {
            return request(server)
                .delete("/api/genres/" + id)
                .set("x-auth-token", token);
        };

        it("should return 403 if client is not an Admin.", async () => {
            token = new User().generateAuthToken();

            const res = await exec();

            expect(res.status).toBe(403);
        });

        it("should return 404 if genre with the given id not exist.", async () => {
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should remove the genre with the given id.", async () => {
            const genre = new Genre({ name: "genre1" });
            await genre.save();
            id = genre._id;
            const res = await exec();

            const result = await Genre.findById(id);
            expect(res.status).toBe(200);
            expect(result).toBeNull();
        });
    });
});
