require("dotenv").config();
const express = require("express");
const app = new express();
const favicon = require("serve-favicon");
const Rooms = require("./models/Rooms");
const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);

mongoose.connect(process.env.CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static(__dirname + "/"));
app.use(favicon(__dirname + "/favicon.ico"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/get/rooms", async (req, res) => {
  let rooms_details = await Rooms.find().sort({ room_number: 1 });
  if (rooms_details.length) {
    let details = rooms_details.map((data) => {
      let { room_number, room_status } = data;
      let status =
        room_status == "D"
          ? "Not clean"
          : room_status == "C"
          ? "Clean"
          : "Cleaning in process";
      return {
        room_number,
        room_number_formatted: `#${room_number}`,
        room_status,
        status,
      };
    });
    res.json(details);
  } else {
    rooms_details = [];
    for (let index = 100; index <= 120; index++) {
      rooms_details.push({
        room_number: index,
      });
    }
    await Rooms.insertMany(rooms_details);
    res.redirect("/get/rooms");
  }
});

io.on("connection", function (socket) {
  socket.on("room_status_update", async function (data) {
    //Update Status in DB
    let { room_number, status } = data;
    await Rooms.where({ room_number }).updateOne({
      $set: { room_status: status },
    });
    socket.broadcast.emit("room_status_update", data);
  });
});

app.get("/manage-rooms", (req, res) => {
  res.sendFile(__dirname + "/views/manage_room.html");
});

app.use(function (req, res, next) {
  res.status(404);
  res.redirect("/");
});

server.listen(process.env.PORT || 8080);
