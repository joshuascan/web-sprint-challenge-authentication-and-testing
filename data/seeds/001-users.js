exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("users")
    .truncate()
    .then(function () {
      // Inserts seed entries
      return knex("users").insert([
        { username: "foo", password: "bar" },
        { username: "baz", password: "1234" },
        { username: "fram", password: "rom" },
      ]);
    });
};
