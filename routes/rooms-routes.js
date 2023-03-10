const express = require("express");
const { check } = require("express-validator");

const roomsController = require("../controllers/rooms-controllers");

const router = express.Router();

// to get the available room list by checkin date
router.post(
  "/",
  [check("checkInDate").not().isEmpty(), check("checkOutDate").not().isEmpty()],
  roomsController.getRooms
);

// to get all the rooms in an array
router.get("/all-rooms", roomsController.getAllRooms);

// to add a new room
router.post(
  "/room-add",
  [check("roomNum").not().isEmpty()],
  roomsController.addRoom
);

module.exports = router;
