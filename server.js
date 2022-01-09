const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 5000;

app.get('/health', (req, res) => {
  res.send("OK");
});

server.listen(port, () => console.log(`🚀 Server is now running on port ${port}`));