const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  identityNum: { type: Number, integer: true, required: true },
  contactNum: { type: String, required: true },
  noOfGuest: { type: Number, integer: true, required: true },
  roomId: { type: Array, default: [], required: true },
  roomNum: { type: Array, default: [] },
  bookingPrice: { type: Number, integer: true, required: true },
  advPayment: { type: Number, integer: true, required: true },
  rate: { type: String, required: true },
  checkInDate: { type: String, default: Date.now, required: true },
  checkOutDate: { type: String, default: Date.now, required: true },
});

module.exports = mongoose.model("Booking", BookingSchema);
