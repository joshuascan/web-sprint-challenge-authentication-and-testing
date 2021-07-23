const db = require("../../data/dbConfig");

function getAll() {
  return db("users");
}

function getById(id) {
  return db("users").where("id", id).first();
}

function getBy(filter) {
  return db("users").where(filter);
}

async function insert(user) {
  const [id] = await db("users").insert(user);
  return getById(id);
}

module.exports = { getAll, getById, getBy, insert };
