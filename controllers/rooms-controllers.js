const { validationResult } = require("express-validator");

const Room = require("../models/room");
const RoomBooking = require("../models/room-booking");

// to get the room list
const getAllRooms = async (req, res, next) => {
  let rooms;
  try {
    rooms = await Room.find({});
  } catch (err) {
    return res.status(500).json({
      message: "Fetching rooms failed, please try again later.",
    });
  }

  res.json({
    rooms,
  });
};

// to get the room list
const getRooms = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Invalid inputs passed, please check your data.",
    });
  }

  const { checkInDate, checkOutDate } = req.body;

  let rooms;
  try {
    rooms = await Room.find({});
  } catch (err) {
    return res.status(500).json({
      message: "Fetching rooms failed, please try again later.",
    });
  }

  let finalRooms = [];

  for (let i = 0; i < rooms.length; i++) {
    let presentBookings = await RoomBooking.find({ roomId: rooms[i]._id });
    if (presentBookings.length > 0) {
      let checkRoomAvailFlag = true;

      for (let i = 0; i < presentBookings.length; i++) {
        let ifAvailableCheckin = dateCheckCustom(
          presentBookings[i].checkInDate,
          presentBookings[i].checkOutDate,
          checkInDate
        );

        let ifAvailableCheckout = dateCheckCustom(
          presentBookings[i].checkInDate,
          presentBookings[i].checkOutDate,
          checkOutDate
        );

        if (!ifAvailableCheckin && !ifAvailableCheckout) {
          let ifAvailableCheckin = dateCheckCustom(
            checkInDate,
            checkOutDate,
            presentBookings[i].checkInDate
          );

          let ifAvailableCheckout = dateCheckCustom(
            checkInDate,
            checkOutDate,
            presentBookings[i].checkOutDate
          );

          if (ifAvailableCheckin || ifAvailableCheckout) {
            checkRoomAvailFlag = false;
            break;
          }
        } else if (ifAvailableCheckin || ifAvailableCheckout) {
          checkRoomAvailFlag = false;
          break;
        }
      }
      if (checkRoomAvailFlag) {
        finalRooms.push(rooms[i]);
      }
    } else {
      finalRooms.push(rooms[i]);
    }
  }

  res.json({
    finalRooms,
  });
};

// date check helper function
dateCheckCustom = (dateFrom, dateTo, dateCheck) => {
  var d1 = convertDate(dateFrom).split("/");
  var d2 = convertDate(dateTo).split("/");
  var c = convertDate(dateCheck).split("/");

  var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]);
  var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
  var check = new Date(c[2], parseInt(c[1]) - 1, c[0]);

  if (check >= from && check <= to) return true;
  else return false;
};

// date convert helper function
convertDate = (inputFormat) => {
  function pad(s) {
    return s < 10 ? "0" + s : s;
  }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join("/");
};

// to add a new room
const addRoom = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Invalid inputs passed, please check your data.",
    });
  }

  const { roomNum } = req.body;

  let existingRoom;
  try {
    existingRoom = await Room.findOne({
      roomNum,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Room creation failed, please check your data.",
    });
  }

  if (existingRoom) {
    return res.status(422).json({
      message: "Room exists already, please check with admin",
    });
  }

  const createdRoom = new Room({
    roomNum,
  });

  try {
    await createdRoom.save();
  } catch (err) {
    return res.status(500).json({
      message: "Room creation failed, please check your data.",
    });
  }

  res.status(201).json({
    roomId: createdRoom.id,
    roomNum: createdRoom.roomNum,
  });
};

exports.getRooms = getRooms;
exports.addRoom = addRoom;
exports.getAllRooms = getAllRooms;
