const { validationResult } = require("express-validator");

const Room = require("../models/room");

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
  rooms.map((room) => {
    let ifAvailableCheckin = dateCheckCustom(
      checkInDate,
      checkOutDate,
      room.checkInDate
    );

    let ifAvailableCheckout = dateCheckCustom(
      checkInDate,
      checkOutDate,
      room.checkOutDate
    );

    if (!ifAvailableCheckin && !ifAvailableCheckout) {
      finalRooms.push(room.toObject({ getters: true }));
    }
  });

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

  const { roomNum, checkInDate, checkOutDate } = req.body;

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
    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
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
    checkInDate: createdRoom.checkInDate,
    checkOutDate: createdRoom.checkOutDate,
  });
};

// to edit an existing room
const editRoom = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Invalid inputs passed, please check your data.",
    });
  }

  const { roomId, checkInDate, checkOutDate } = req.body;

  if (roomId === "" || roomId === null || roomId === undefined) {
    return res.status(422).json({
      message: "Invalid inputs passed, please check your data.",
    });
  }

  let existingRoom;
  try {
    existingRoom = await Room.findOne({
      _id: roomId,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Room updation failed, please check your data.",
    });
  }

  if (!existingRoom) {
    return res.status(422).json({
      message: "Room does not exist, please check with admin",
    });
  }

  const updatedRoom = {
    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
  };

  try {
    const query = { _id: roomId };
    const update = { $set: updatedRoom };
    const options = {};
    await Room.updateOne(query, update, options);
  } catch (err) {
    return res.status(500).json({
      message: "Room updation failed, please check your data.",
    });
  }

  res.status(200).json({
    message: "room updated successfully",
  });
};

exports.getRooms = getRooms;
exports.addRoom = addRoom;
exports.editRoom = editRoom;
