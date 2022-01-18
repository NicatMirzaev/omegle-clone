import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from 'peerjs';

let socket = null;
let peer = null;
let currentCall = null;

function Loading() {
  return (
    <svg
      className="spinner"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="#FFFFFF"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function App() {
  const myVideo = useRef();
  const remoteVideo = useRef()
  const [started, setStarted] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [isTalking, setIsTalking] = useState(false);
  const [permission, setPermission] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      myVideo.current.srcObject = stream;
      myVideo.current.volume = 0;
      myVideo.current.muted = true;
      myVideo.current.play();

      setPermission(true);
      socket = io();
      socket.on("new-user", ({ peer_id, remote_peer_id }) => {
        setStarted(true);
        setPeerId(peer_id);

        peer = new Peer(peer_id);

        peer.on("open", id => {
          if(remote_peer_id != null) {
            callPeer(stream, remote_peer_id)
          }
        })


        peer.on("call", function(call) {
          call.answer(stream);
          call.on('stream', function(remoteStream) {
            remoteVideo.current.srcObject = remoteStream;
            remoteVideo.current.play();
          });

          setIsTalking(true);

          currentCall = call 
        });

      })
      socket.on("peer-disconnected", ({ new_remote_peer_id }) => {
        currentCall?.close();
        remoteVideo.current.pause();
        remoteVideo.current.removeAttribute('src'); // empty source
        remoteVideo.current.load();
        setIsTalking(false);

        if(new_remote_peer_id !== null) {
          callPeer(stream, new_remote_peer_id);
        }
      })

      socket.on("new-peer", ({ new_remote_peer_id }) => {
        setStarted(true);
        if(new_remote_peer_id !== null) {
          callPeer(stream, new_remote_peer_id);
        }
      })

    })
    .catch(error => {
      console.log(error);
      setPermission(false);
    })

    return () => socket.disconnect(); //cleanup

  }, [])

  const onClickStart = () => {
    if(!permission) return;

    if(!started && peerId === null) {
      socket.emit("new-user");
    }
    else if(!started && peerId !== null) {
      socket.emit("start");
    }
    else if(started && peerId !== null) {
      currentCall?.close();
      remoteVideo.current.pause();
      remoteVideo.current.removeAttribute('src');
      remoteVideo.current.load();
      setIsTalking(false);
      socket.emit("next");
    }
  }

  const onClickStop = () => {
    if(!started) return;
    currentCall?.close();
    remoteVideo.current.pause();
    remoteVideo.current.removeAttribute('src');
    remoteVideo.current.load();
    setIsTalking(false);
    setStarted(false);
    socket.emit("stop");
  }

  const callPeer = (stream, peer_id) => {
    var call = peer.call(peer_id, stream);
    call.on('stream', remoteStream => { 
      remoteVideo.current.srcObject = remoteStream;
      remoteVideo.current.play();
      setIsTalking(true);
    });
  }

  return (
    <div className="container">
      <div className="leftSection">
        <div className="video">
          <video muted ref={myVideo} />
          {!started && <span style={{textAlign: "center", color: "white"}}>To get started, please allow camera and microphone access. Then click to start button.</span>}
        </div>
        <div className="buttons">
          <button onClick={onClickStart} className="btnNext">{!started ? "Start" : "Next"}</button>
          <button onClick={onClickStop} disabled={!started} className="btnStop">Stop</button>
        </div>
      </div>
      <div className="rightSection">
        <div className="video">
          <video ref={remoteVideo} />
          {started === true && isTalking === false ? <Loading/> : null}
        </div>
      </div>
    </div>
  );
}

export default App;
