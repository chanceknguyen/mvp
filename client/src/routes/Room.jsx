import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import RecordRTC from 'recordrtc';
import { VideoContainer, Video, ButtonContainer } from '../styles.js';

const Room = (props) => {
  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  const userStream = useRef();
  const [self, setSelf] = useState();
  const [partner, setPartner] = useState();

  const [isRecording, setIsRecording] = useState('Record');

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(stream => {
      userVideo.current.srcObject = stream;
      userStream.current = stream;
      setSelf(RecordRTC(userVideo.current.srcObject, {type: 'video', mimeType: 'video/webm'}));

      socketRef.current = io.connect('/');
      socketRef.current.emit('join room', props.match.params.roomID);

      socketRef.current.on('other user', userID => {
        callUser(userID);
        otherUser.current = userID;
      });

      socketRef.current.on('user joined', userID => {
        otherUser.current = userID;
      });

      socketRef.current.on('offer', handleReceiveCall);

      socketRef.current.on('answer', handleAnswer);

      socketRef.current.on('ice-candidate', handleNewICECandidateMsg);
    });

  }, []);

  function callUser(userID) {
    peerRef.current = createPeer(userID);
    userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
  }

  function createPeer(userID) {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org"
        },
        {
          urls: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
        },
      ]
    });

    peer.onicecandidate = handleICECandidateEvent;
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

    return peer;
  }

  function handleNegotiationNeededEvent(userID) {
    peerRef.current.createOffer().then(offer => {
      return peerRef.current.setLocalDescription(offer);
    }).then(() => {
      const payload = {
        target: userID,
        caller: socketRef.current.id,
        sdp: peerRef.current.localDescription
      };
      socketRef.current.emit('offer', payload);
    }).catch(e => console.log(e));
  }

  function handleReceiveCall(incoming) {
    peerRef.current = createPeer();
    const desc = new RTCSessionDescription(incoming.sdp);
    peerRef.current.setRemoteDescription(desc).then(() => {
      userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
    }).then(() => {
      return peerRef.current.createAnswer();
    }).then(answer => {
      return peerRef.current.setLocalDescription(answer);
    }).then(() => {
      const payload = {
        target: incoming.caller,
        caller: socketRef.current.id,
        sdp: peerRef.current.localDescription
      }
      socketRef.current.emit('answer', payload);
    })
  }

  function handleAnswer(message) {
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
  }

  function handleICECandidateEvent(e) {
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      }
      socketRef.current.emit('ice-candidate', payload);
    }
  }

  function handleNewICECandidateMsg(incoming) {
    const candidate = new RTCIceCandidate(incoming);

    peerRef.current.addIceCandidate(candidate)
      .catch(e => console.log(e));
  }

  function handleTrackEvent(e) {
    partnerVideo.current.srcObject = e.streams[0];
    setPartner(RecordRTC(partnerVideo.current.srcObject, {type: 'video', mimeType: 'video/webm'}));
  };

  function handleClick(e) {
    if (isRecording === 'Record') {
      recordBoth();
    } else {
      stopRecording();
    }
  }

  function recordBoth() {
    setIsRecording('Recording...')
    self.startRecording();
    partner.startRecording();
    console.log('self', self);
    console.log('partner', partner);
  }

  function stopRecording() {
    console.log('self', self);
    console.log('partner', partner);
    self.stopRecording(() => {
      self.save('self-recording.webm');
    })
    partner.stopRecording(() => {
      partner.save('partner-recording.webm');
    });
    setIsRecording('Record')
  }

  return (
    <div>
    <VideoContainer>
      <Video autoPlay muted ref={userVideo} />
      <Video autoPlay ref={partnerVideo} />
    </VideoContainer>
    <ButtonContainer>
      <button onClick={(e) => handleClick(e)}>{isRecording}</button>
    </ButtonContainer>
    </div>
  )

};

export default Room;