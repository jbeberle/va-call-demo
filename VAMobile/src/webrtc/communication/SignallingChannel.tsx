import {RTCIceCandidate, RTCSessionDescription} from "react-native-webrtc";
import {setNewMessage} from "./WebRtcChannel";

export class SignallingChannel {
    signalingChannel:WebSocket ;

    constructor(peerConnection: RTCPeerConnection | null, signalingChannel: WebSocket) {
        this.signalingChannel = signalingChannel;

        this.signalingChannel.addEventListener('message', (message) => {
            console.log(`Received message: ${message}`);
            console.log(message);
            console.log(message.data);
            let obj = JSON.parse(message.data);
            console.log(obj);
            if(obj?.event === "candidate") {
                console.log("I got a candidate!");
                console.log(obj.data);
                try {
                    peerConnection?.addIceCandidate(new RTCIceCandidate(obj.data)).catch((err) => {
                        console.log("error1!");
                        console.log(err);
                    });
                } catch(e:unknown) {
                    console.log("error2!");
                    console.log(e);
                }
            }
            else if (obj?.event === "offer") {
                console.log("I got an offer!")
                console.log(obj.data);
                if(peerConnection?.signalingState !== "stable") {
                    peerConnection?.setRemoteDescription(new RTCSessionDescription(obj.data));
                }
                peerConnection?.createAnswer((answer) => {
                    peerConnection?.setLocalDescription(answer);
                    this.send({
                        event : "answer",
                        data : answer
                    });
                }, function(error) {
                    // Handle error here
                });
            }
            else if (obj?.event === "answer") {
                console.log("I got an answer!");
                // if(peerConnection?.signalingState !== "stable") {
                console.log(`state=${peerConnection?.signalingState}`)
                    peerConnection?.setRemoteDescription(new RTCSessionDescription(obj.data));
                // }
                // else {
                //     console.log(`Unable to set remote description due to invalid signaling state + ${peerConnection?.signalingState}`)
                // }
            }
            else if (obj?.event === "chat") {
                console.log("I got a chat!");
                if(obj?.from === "2") {
                    console.log("  Chat:  setting message from 2")
                    setNewMessage(obj?.message)
                }
            }
        });

    }

    send(message:any) {
        console.log(`sending message: ${JSON.stringify(message)}`);
        this.signalingChannel.send(JSON.stringify(message));
    }






}



