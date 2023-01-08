const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");

const router = express.Router();

//to login the user
router.post(
  "/login",
  [check("email").not().isEmpty(), check("password").not().isEmpty()],
  usersController.login
);

//to change user password
router.post(
  "/changePassword",
  [
    check("email").not().isEmpty(),
    check("oldPassword").not().isEmpty(),
    check("newPassword").not().isEmpty(),
  ],
  usersController.changePassword
);

module.exports = router;
