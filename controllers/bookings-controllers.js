const { validationResult } = require("express-validator");

const Booking = require("../models/booking");
const Room = require("../models/room");
const RoomBooking = require("../models/room-booking");

// to get the booking list
const getBookings = async (req, res, next) => {
  let bookings;
  try {
    bookings = await Booking.find({});
  } catch (err) {
    return res.status(500).json({
      message: "Fetching bookings failed, please try again later.",
    });
  }
  res.json({
    bookings: bookings.map((booking) => {
      let finalBookingData = booking.toObject({ getters: true });
      return {
        ...finalBookingData,
        showCheckInDate: convertDate(finalBookingData.checkInDate),
        showCheckOutDate: convertDate(finalBookingData.checkOutDate),
      };
    }),
  });
};

// to get single booking
const getBooking = async (req, res, next) => {
  let bookingId = req.params.bookingId;
  let booking;
  try {
    booking = await Booking.find({ _id: bookingId });
  } catch (err) {
    return res.status(500).json({
      message: "Fetching booking failed, please try again later.",
    });
  }

  let finalBookingData = booking[0].toObject({ getters: true });

  res.json({
    booking: {
      ...finalBookingData,
      showCheckInDate: convertDate(finalBookingData.checkInDate),
      showCheckOutDate: convertDate(finalBookingData.checkOutDate),
    },
  });
};

// to add a new booking
const addBooking = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Invalid inputs passed, please check your data.",
    });
  }

  const {
    name,
    address,
    identityNum,
    contactNum,
    noOfGuest,
    roomId,
    checkInDate,
    checkOutDate,
  } = req.body;

  let existingBooking;
  try {
    existingBooking = await Booking.findOne({
      contactNum,
      checkInDate: new Date(checkInDate),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Booking creation failed, please check your data.",
    });
  }

  if (existingBooking) {
    return res.status(422).json({
      message: "Booking exists already, please check with admin",
    });
  }

  let roomNums = [];

  try {
    // to find room number
    for (let i = 0; i < roomId.length; i++) {
      let findRoom = await Room.find({ _id: roomId[i] });
      roomNums.push(findRoom[0]["roomNum"]);
    }
  } catch (err) {
    return res.status(500).json({
      message: "Booking creation failed, please check your data.",
    });
  }

  const createdBooking = new Booking({
    name,
    address,
    identityNum,
    contactNum,
    noOfGuest,
    roomId,
    roomNum: roomNums,
    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
  });

  try {
    // to add booking after room availability saved
    await createdBooking.save();

    // to edit room's availability
    for (let i = 0; i < roomId.length; i++) {
      const createRoomBooking = new RoomBooking({
        bookingId: createdBooking.id,
        roomId: roomId[i],
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
      });

      await createRoomBooking.save();
    }
  } catch (err) {
    return res.status(500).json({
      message: "Booking creation failed, please check your data.",
    });
  }

  res.status(201).json({
    bookingId: createdBooking.id,
    name: createdBooking.name,
    address: createdBooking.address,
    identityNum: createdBooking.identityNum,
    contactNum: createdBooking.contactNum,
    noOfGuest: createdBooking.noOfGuest,
    roomId: createdBooking.roomId,
    roomNum: createdBooking.roomNum,
    checkInDate: convertDate(createdBooking.checkInDate),
    checkOutDate: convertDate(createdBooking.checkOutDate),
  });
};

// date convert helper function
convertDate = (inputFormat) => {
  function pad(s) {
    return s < 10 ? "0" + s : s;
  }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join("/");
};

// to edit an existing booking
const editBooking = async (req, res, next) => {
  let bookingId = req.params.bookingId;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Invalid inputs passed, please check your data.",
    });
  }

  const {
    name,
    address,
    identityNum,
    contactNum,
    noOfGuest,
    roomId,
    checkInDate,
    checkOutDate,
  } = req.body;

  let roomNums = [];

  try {
    // to find room number
    for (let i = 0; i < roomId.length; i++) {
      let findRoom = await Room.find({ _id: roomId[i] });
      roomNums.push(findRoom[0]["roomNum"]);
    }
  } catch (err) {
    return res.status(500).json({
      message: "Booking edit failed, please check your data.",
    });
  }

  const updatedBooking = {
    name,
    address,
    identityNum,
    contactNum,
    noOfGuest,
    roomId,
    roomNum: roomNums,
    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
  };

  try {
    //to update exixting booking
    const query = { _id: bookingId };
    const update = { $set: updatedBooking };
    const options = {};
    await Booking.updateOne(query, update, options);

    // to delete all previously booked room associated with this booking ID
    await RoomBooking.deleteMany({ bookingId: bookingId });

    // to create new rooms booking with this booking ID
    for (let i = 0; i < roomId.length; i++) {
      const updateRoomBooking = new RoomBooking({
        bookingId: bookingId,
        roomId: roomId[i],
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
      });

      await updateRoomBooking.save();
    }
  } catch (err) {
    return res.status(500).json({
      message: "Booking updation failed, please check your data.",
    });
  }

  res.status(200).json({
    message: "booking updated successfully",
  });
};

// to delete an existing booking
const deleteBooking = async (req, res, next) => {
  let bookingId = req.params.bookingId;

  try {
    // to edit an existing room's availability
    await RoomBooking.deleteMany({ bookingId: bookingId });

    //delete booking logic
    const query = { _id: bookingId };
    const result = await Booking.deleteOne(query);
    if (result.deletedCount === 1) {
      res.status(200).json({
        message: "Booking deleted successfully.",
      });
    } else {
      res.status(400).json({
        message: "There is no booking for this ID. Nothing to delete!",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Fetching booking failed, please try again later.",
    });
  }
};

// to edit bookingRoom table and delete one entry by booking id and room id
const editRoomBooking = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Invalid inputs passed, please check your data.",
    });
  }

  const { bookingId, roomId, roomRemainIds } = req.body;

  let existingRoomBooking;
  try {
    existingRoomBooking = await RoomBooking.findOne({
      bookingId,
      roomId,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Booking Search failed, please check your data.",
    });
  }

  if (!existingRoomBooking) {
    return res.status(422).json({
      message: "Booking does not exist, please check with admin",
    });
  }

  let roomNums = [];

  try {
    // to find room number
    for (let i = 0; i < roomRemainIds.length; i++) {
      let findRoom = await Room.find({ _id: roomRemainIds[i] });
      roomNums.push(findRoom[0]["roomNum"]);
    }
  } catch (err) {
    return res.status(500).json({
      message: "Booking edit failed, please check your data.",
    });
  }

  try {
    // update booking table to sync with the next step
    const updatedBooking = {
      roomId: roomRemainIds,
      roomNum: roomNums,
    };

    const queryroom = { _id: bookingId };
    const update = { $set: updatedBooking };
    const options = {};
    await Booking.updateOne(queryroom, update, options);

    // delete respective booking from roombookings table
    const query = { bookingId, roomId };
    const result = await RoomBooking.deleteOne(query);
    if (result.deletedCount === 1) {
      res.status(200).json({
        message: "Room Booking deleted successfully.",
      });
    } else {
      res.status(400).json({
        message: "There is no booked room for this ID. Nothing to delete!",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Room Booking edit failed, please check your data.",
    });
  }
};

exports.getBookings = getBookings;
exports.getBooking = getBooking;
exports.addBooking = addBooking;
exports.editBooking = editBooking;
exports.deleteBooking = deleteBooking;
exports.editRoomBooking = editRoomBooking;
