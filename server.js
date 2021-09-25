const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

let users = [];

const messages = {
  General: [],
  Sports: [],
  JavaScript: [],
  "Top Bants": [],
};

io.on("connection", (socket) => {
  socket.on("join server", (username) => {
    const user = {
      username,
      id: socket.id,
    };
    users.push(user);
    io.emit("new user", users);
  });
  socket.on("join room", (roomName, cb) => {
    socket.join(roomName);
    cb(messages[roomName]); //when you join room you get a cb and that cb gives you old messages
  });

  socket.on("send message", ({ content, to, sender, chatName, isChannel }) => {
    if (isChannel) {
      const payload = {
        content,
        chatName,
        sender,
      };
      socket.to(to).emit("new message", payload);
    } else {
      const payload = {
        content,
        chatName: sender,
        sender,
      };
      socket.to(to).emit("new message", payload);
    }
    if (messages[chatName]) {
      messages[chatName].push({
        sender,
        content,
      });
    }
  });
  socket.on("disconnect", () => {
    users = users.filter((u) => u.id !== socket.id);
    io.emit("new user", users);
  });
});

server.listen(1337, () => console.log("server taking off on port 1337"));
