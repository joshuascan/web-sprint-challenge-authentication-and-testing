const request = require("supertest");
const db = require("../data/dbConfig");
const server = require("./server");

test("sanity", () => {
  expect(true).toBe(true);
});

test("is the correct environment", () => {
  expect(process.env.NODE_ENV).toBe("testing");
});

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db.seed.run();
});
afterAll(async () => {
  await db.destroy();
});

describe("[POST] /api/auth/register", () => {
  test("successfully adds new user to the users table", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "Betty", password: "1234" });
    expect(await db("users")).toHaveLength(4);
  });
  test("responds with the newly added user", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ username: "Betty", password: "1234" });
    expect(res.body).toMatchObject({ id: 4, username: "Betty" });
  });
  test("responds with correct error message when username and/or password are missing", async () => {
    const err = await request(server).post("/api/auth/register");
    expect(err.body.message).toBe("username and password required");
  });
  test("responds with correct status code when missing username/password", async () => {
    const err = await request(server).post("/api/auth/register");
    expect(err.status).toBe(422);
  });
});

describe("[POST] /api/auth/login", () => {
  test("responds with correct message and status upon successful login", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "Dortholomew the Third", password: "1234" });
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "Dortholomew the Third", password: "1234" });
    expect(res.body).toMatchObject({
      message: "welcome, Dortholomew the Third",
    });
    expect(res.status).toBe(200);
  });
  test("responds with correct message and status when using invalid credentials", async () => {
    const err = await request(server)
      .post("/api/auth/login")
      .send({ username: "I don't exist", password: "wrong" });
    expect(err.body.message).toBe("invalid credentials");
    expect(err.status).toBe(401);
  });
});

describe;
