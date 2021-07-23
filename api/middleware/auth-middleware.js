const Users = require("../users/users-model");

const checkUsernameAvailable = async (req, res, next) => {
  try {
    const existing = await Users.getBy({ username: req.body.username }).first();
    if (existing) {
      next({ status: 422, message: "username taken" });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};

const validateReqBody = (req, res, next) => {
  const { username, password } = req.body;
  if (username === undefined || password === undefined) {
    next({ status: 422, message: "username and password required" });
  } else {
    next();
  }
};

module.exports = { checkUsernameAvailable, validateReqBody };
