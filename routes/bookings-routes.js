const express = require("express");
const { check } = require("express-validator");

const bookingsController = require("../controllers/bookings-controllers");

const router = express.Router();

// to get the booking list
router.get("/", bookingsController.getBookings);

// to get single booking
router.get("/:bookingId", bookingsController.getBooking);

// to add a new booking
router.post(
  "/booking-add",
  [
    check("name").not().isEmpty(),
    check("address").not().isEmpty(),
    check("identityNum").not().isEmpty(),
    check("contactNum").not().isEmpty(),
    check("noOfGuest").not().isEmpty(),
    check("roomId").not().isEmpty(),
    check("checkInDate").not().isEmpty(),
    check("checkOutDate").not().isEmpty(),
  ],
  bookingsController.addBooking
);

// to edit an existing booking
router.patch(
  "/booking-edit/:bookingId",
  [
    check("name").not().isEmpty(),
    check("address").not().isEmpty(),
    check("identityNum").not().isEmpty(),
    check("contactNum").not().isEmpty(),
    check("noOfGuest").not().isEmpty(),
    check("roomId").not().isEmpty(),
    check("checkInDate").not().isEmpty(),
    check("checkOutDate").not().isEmpty(),
  ],
  bookingsController.editBooking
);

// to delete single booking
router.delete("/:bookingId", bookingsController.deleteBooking);

// to edit bookingRoom table and delete one entry by booking id and room id
router.patch(
  "/room-booking-edit",
  [
    check("bookingId").not().isEmpty(),
    check("roomId").not().isEmpty(),
    check("roomRemainIds").not().isEmpty(),
  ],
  bookingsController.editRoomBooking
);

module.exports = router;
