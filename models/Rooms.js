const mongoose = require("mongoose");
const router = require("express").Router();

const RoomSchema = new mongoose.Schema({
  room_number: {
    required: true,
    type: String,
    unique: true,
  },
  room_status: {
    type: String,
    enum: ["D", "C", "P"],
    default: "D",
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.model("rooms", RoomSchema);
