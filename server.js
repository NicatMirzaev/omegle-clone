const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require('uuid');
const port = process.env.PORT || 5000;

let users = [];

app.get('/health', (req, res) => {
  res.send(users);
});

io.on("connection", socket => {
  socket.on("new-user", () => {
    const generatedUUID = uuidv4();
    let remote_peer_id = searchForPeer(generatedUUID);

    const user = {
      started: true,
      peer_id: generatedUUID,
      socket_id: socket.id,
      remote_peer_id,
    }

    users.push(user);


    socket.emit("new-user", { peer_id: generatedUUID, remote_peer_id });

    console.log(`A user connected (peer id: ${generatedUUID}`);
  })

  socket.on("stop", () => {
    let remote_peer_id = null;
    for(let i = 0; i < users.length; i++) {
      const socket_id = users[i].socket_id;
      if(socket_id === socket.id) {
        users[i].started = false;
        remote_peer_id = users[i].remote_peer_id;
        users[i].remote_peer_id = null;
        break;
      }
    }

    if(remote_peer_id !== null) {
      for(let i = 0; i < users.length; i++) {
        const { peer_id, socket_id } = users[i];
        if(peer_id === remote_peer_id) {
          const new_remote_peer_id = searchForPeer(peer_id);
          users[i].started = true;
          users[i].remote_peer_id = new_remote_peer_id;
          io.to(socket_id).emit("peer-disconnected", { new_remote_peer_id });
        }
      }
    }
  })
  
  

  socket.on("start", () => {
    for(let i = 0; i < users.length; i++) {
      const { peer_id, socket_id} = users[i];
      if(socket_id === socket.id) {
        const new_remote_peer_id = searchForPeer(peer_id);
        users[i].started = true;
        users[i].remote_peer_id = new_remote_peer_id;
        io.to(socket_id).emit("new-peer", { new_remote_peer_id });
        break;
      }
    }
  })

  socket.on("next", () => {
    let remote_peer_id = null;
    for(let i = 0; i < users.length; i++) {
      const { peer_id, socket_id} = users[i];
      if(socket_id === socket.id) {
        const new_remote_peer_id = searchForPeer(peer_id);
        users[i].started = true;
        remote_peer_id = users[i].remote_peer_id;
        users[i].remote_peer_id = new_remote_peer_id;
        io.to(socket_id).emit("new-peer", { new_remote_peer_id });
        break;
      }
    }
    if(remote_peer_id !== null) {
      for(let i = 0; i < users.length; i++) {
        const { peer_id, socket_id} = users[i];
        if(peer_id === remote_peer_id) {
          const new_remote_peer_id = searchForPeer(peer_id);
          users[i].started = true;
          users[i].remote_peer_id = new_remote_peer_id;
          io.to(socket_id).emit("peer-disconnected", { new_remote_peer_id });
          break;
        }
      }
    }
  })

  socket.on("disconnect", () => {
    let remote_peer_id = null;
    users = users.filter(user => {
      if(user.socket_id === socket.id) {
        console.log(`A user disconnected (peer id: ${user.peer_id}`);
        remote_peer_id = user.remote_peer_id;
        return false;
      }
      return true;
    })
    if(remote_peer_id != null) {
      onPeerDisconnect(remote_peer_id);
    }
  })
})

function onPeerDisconnect(user_peer_id) {
  const index = users.findIndex(user => user.peer_id === user_peer_id);
  if(index !== -1) {
    const { peer_id, socket_id } = users[index];
    const new_remote_peer_id = searchForPeer(peer_id);
    users[index].remote_peer_id = new_remote_peer_id;
    io.to(socket_id).emit("peer-disconnected", { new_remote_peer_id });
  }
}

function searchForPeer(user_peer_id) {
  let found = null;
  for(let i = 0; i < users.length; i++) {
    const { started, peer_id, remote_peer_id } = users[i];

    if(started === true && remote_peer_id === null && peer_id !== user_peer_id) {
      users[i].remote_peer_id = user_peer_id;
      found = peer_id;
      break;
    }
  }
  return found;
}

server.listen(port, () => console.log(`🚀 Server is now running on port ${port}`));