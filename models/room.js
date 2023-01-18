const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  roomNum: { type: Number, integer: true, required: true },
});

module.exports = mongoose.model("Room", RoomSchema);
