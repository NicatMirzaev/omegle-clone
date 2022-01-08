import { useEffect, useRef } from "react";

function App() {
  const myVideo = useRef();

  useEffect(() => {
    console.log("a");
    navigator.mediaDevices.getUserMedia({ video: true, audio: true})
    .then(stream => {
      console.log(myVideo, stream);
      myVideo.current.srcObject = stream;
    })
    .catch(error => {
      console.log(error);
    })
  }, [myVideo])

  return (
    <div className="container">
      <div className="leftSection">
        <div className="my-video">
          <video autoPlay ref={myVideo}></video>
        </div>
        <div className="buttons">
          <button className="btnNext">Next</button>
          <button className="btnStop">Stop</button>
        </div>
      </div>
      <div className="rightSection">
        <div className="my-video">
          test
        </div>
      </div>
    </div>
  );
}

export default App;
