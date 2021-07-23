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
  test("responds with correct error message and status when using invalid credentials", async () => {
    const err = await request(server)
      .post("/api/auth/login")
      .send({ username: "I don't exist", password: "wrong" });
    expect(err.body.message).toBe("invalid credentials");
    expect(err.status).toBe(401);
  });
  test("responds with correct error message and status code when missing username/password", async () => {
    const err = await request(server).post("/api/auth/login");
    expect(err.body.message).toBe("username and password required");
    expect(err.status).toBe(422);
  });
});

describe("[GET] /api/jokes", () => {
  test("responds with an array of jokes when accessed with correct token", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "John", password: "Shmoe" });
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "John", password: "Shmoe" });
    const jokes = await request(server)
      .get("/api/jokes")
      .set("authorization", res.body.token);
    expect(jokes.body).toMatchObject([
      {
        id: "0189hNRf2g",
        joke: "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later.",
      },
      {
        id: "08EQZ8EQukb",
        joke: "Did you hear about the guy whose whole left side was cut off? He's all right now.",
      },
      {
        id: "08xHQCdx5Ed",
        joke: "Why didn’t the skeleton cross the road? Because he had no guts.",
      },
    ]);
  });
  test("responds with correct error message and status when accessed without token", async () => {
    const err = await request(server).get("/api/jokes");
    expect(err.body.message).toBe("token required");
    expect(err.status).toBe(401);
  });
  test("responds with correct error message and status when accessed using invalid token", async () => {
    const err = await request(server)
      .get("/api/jokes")
      .set("authorization", "abcd1234");
    expect(err.body.message).toBe("token invalid");
    expect(err.status).toBe(401);
  });
});
