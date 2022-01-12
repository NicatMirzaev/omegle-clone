const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require('uuid');
const port = process.env.PORT || 5000;

let users = [];

app.get('/health', (req, res) => {
  res.send("OK");
});

io.on("connection", socket => {
  socket.on("new-user", () => {
    const generatedUUID = uuidv4();
    let remote_peer_id = null;

    for(const user of users) {
      if(user.started === true && user.remote_peer_id === null) {
        remote_peer_id = user.peer_id;
        console.log(user);
        io.to(user.socket_id).emit("peer-found", { id: generatedUUID });
        break;
      }
    }

    const user = {
      started: true,
      peer_id: generatedUUID,
      socket_id: socket.id,
      remote_peer_id
    }

    users.push(user);


    socket.emit("new-user", { peer_id: generatedUUID, remote_peer_id });

    console.log(`A user connected (peer id: ${generatedUUID}`);
  })
  socket.on("disconnect", () => {
    users = users.filter(user => {
      if(user.socket_id === socket.id) {
        console.log(`A user disconnected (peer id: ${user.peer_id}`);
        return true;
      }
      return false;
    })
  })
})

server.listen(port, () => console.log(`🚀 Server is now running on port ${port}`));