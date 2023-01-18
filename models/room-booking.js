const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RoomBookingSchema = new Schema({
  bookingId: { type: String, integer: true, required: true },
  roomId: { type: String, integer: true, required: true },
  checkInDate: { type: String, default: Date.now, required: true },
  checkOutDate: { type: String, default: Date.now, required: true },
});

module.exports = mongoose.model("RoomBooking", RoomBookingSchema);
