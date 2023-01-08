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

// to add a new room
router.post(
  "/room-add",
  [
    check("roomNum").not().isEmpty(),
    check("checkInDate").not().isEmpty(),
    check("checkOutDate").not().isEmpty(),
  ],
  roomsController.addRoom
);

// to edit an existing room
router.patch(
  "/room-edit",
  [check("checkInDate").not().isEmpty(), check("checkOutDate").not().isEmpty()],
  roomsController.editRoom
);

module.exports = router;
