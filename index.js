const express = require("express");
const app = new express();
const fs = require("fs");
const favicon = require("serve-favicon");

var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static(__dirname + "/node_modules"));
app.use(favicon(__dirname + "/favicon.ico"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/get/rooms", (req, res) => {
  let rooms_details = fs.readFileSync(__dirname + "/data/room.json");
  rooms_details = JSON.parse(rooms_details);
  res.json(rooms_details);
});

io.on("connection", function (socket) {
  socket.on("room_status_update", function (data) {
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
