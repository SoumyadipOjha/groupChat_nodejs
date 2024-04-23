const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const moment = require("moment");
const app = express();
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`));

// nice

const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(
  "mongodb+srv://soumyadipojha635:ZQgAO9ArFlU2bjAG@cluster0.i5uqcq6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const messageSchema = new mongoose.Schema({
  name: String,
  message: String,
  dateTime: Date,
});

const Message = mongoose.model("Message", messageSchema);

let socketsConected = new Set();

io.on("connection", onConnected);

function onConnected(socket) {
  console.log("Socket connected", socket.id);
  socketsConected.add(socket.id);
  io.emit("clients-total", socketsConected.size);

  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.id);
    socketsConected.delete(socket.id);
    io.emit("clients-total", socketsConected.size);
  });

  socket.on("message", (data) => {
    saveMessageToDB(data)
      .then((savedMessage) => {
        io.emit("chat-message", savedMessage);
      })
      .catch((err) => {
        console.error("Error saving message:", err);
      });
  });

  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });
}

function saveMessageToDB(data) {
  const newMessage = new Message({
    name: data.name,
    message: data.message,
    dateTime: data.dateTime,
  });

  return newMessage.save();
}

// API endpoint to get all messages
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find({});
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Error fetching messages" });
  }
});
