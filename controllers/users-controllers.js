const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

//to login the user
const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Invalid inputs passed, please check your data.",
    });
  }

  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return res.status(500).json({
      message: "Logging in failed, please try again later.",
    });
  }

  if (!existingUser) {
    return res.status(403).json({
      message: "Invalid credentials, could not log you in.",
    });
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return res.status(500).json({
      message:
        "Could not log you in, please check your credentials and try again.",
    });
  }

  if (!isValidPassword) {
    return res.status(403).json({
      message: "Invalid credentials, could not log you in.",
    });
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
  });
};

//to change user password
const changePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Invalid inputs passed, please check your data.",
    });
  }

  const { email, oldPassword, newPassword } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return res.status(500).json({
      message: "Logging in failed, please try again later.",
    });
  }

  if (!existingUser) {
    return res.status(403).json({
      message: "User does not exist with this email.",
    });
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(oldPassword, existingUser.password);
  } catch (err) {
    return res.status(500).json({
      message:
        "Could not log you in, please check your credentials and try again.",
    });
  }

  if (!isValidPassword) {
    return res.status(403).json({
      message: "Invalid credentials, could not log you in.",
    });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(newPassword, 12);
  } catch (err) {
    return res.status(500).json({
      message: "Could not change password, please try again.",
    });
  }

  const updatedPassword = {
    password: hashedPassword,
  };

  try {
    const query = { _id: existingUser.id };
    const update = { $set: updatedPassword };
    const options = {};
    await User.updateOne(query, update, options);
  } catch (err) {
    return res.status(500).json({
      message: "Changing password failed, please try again later.",
    });
  }

  res.json({
    message: "Password changed successfully.",
  });
};

exports.login = login;
exports.changePassword = changePassword;
