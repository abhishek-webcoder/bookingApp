const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  identityNum: { type: Number, integer: true, required: true },
  contactNum: { type: String, required: true },
  noOfGuest: { type: Number, integer: true, required: true },
  checkInDate: { type: String, default: Date.now, required: true },
  checkOutDate: { type: String, default: Date.now, required: true },
  totalRate: { type: Number, integer: true, required: true },
  advanceAmount: { type: Number, integer: true, required: true },
  rateChart: { type: String, required: true },
});

module.exports = mongoose.model("Customer", CustomerSchema);
